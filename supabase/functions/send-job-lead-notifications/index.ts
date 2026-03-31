import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildEmail,
  EmailJobSummary,
  EmailSectionHeading,
  EmailHighlightBox,
} from "../_shared/email-templates/components.tsx";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Kluje <notifications@kluje.com>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobLeadNotificationRequest {
  jobId: string;
  maxDistance?: number; // Optional max distance in miles
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function trackEmailNotification(
  supabase: any,
  recipientId: string,
  recipientEmail: string,
  emailType: string,
  relatedEntityId: string,
  relatedEntityType: string,
  subject: string,
  status: 'sent' | 'error',
  resendId?: string,
  errorMessage?: string
) {
  try {
    await supabase.from('email_notifications').insert({
      recipient_id: recipientId,
      recipient_email: recipientEmail,
      email_type: emailType,
      related_entity_id: relatedEntityId,
      related_entity_type: relatedEntityType,
      subject: subject,
      status: status,
      resend_id: resendId || null,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.error('Failed to track email notification:', error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId }: JobLeadNotificationRequest = await req.json();

    if (!jobId) {
      throw new Error("Missing jobId");
    }

    console.log(`Processing job lead notifications for job: ${jobId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the job details
    const { data: job, error: jobError } = await supabase
      .from("job_listings")
      .select("id, title, description, location, budget_min, budget_max, category_id, latitude, longitude, posted_by")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to fetch job: ${jobError?.message || "Not found"}`);
    }

    // Get category name and find all related subcategories
    let categoryName = "General";
    let categoryIds: string[] = [];
    
    if (job.category_id) {
      // Get the category and check if it's a parent or child
      const { data: category } = await supabase
        .from("service_categories")
        .select("id, name, parent_id")
        .eq("id", job.category_id)
        .single();
      
      if (category) {
        categoryName = category.name;
        categoryIds.push(category.id);
        
        // If it's a subcategory, also include the parent
        if (category.parent_id) {
          categoryIds.push(category.parent_id);
        }
        
        // Also get any child categories
        const { data: childCategories } = await supabase
          .from("service_categories")
          .select("id")
          .eq("parent_id", job.category_id);
        
        if (childCategories) {
          categoryIds.push(...childCategories.map(c => c.id));
        }
      }
    }

    // Find providers who offer services matching this job's category
    let providersQuery = supabase
      .from("provider_services")
      .select("provider_id, category_id");
    
    if (categoryIds.length > 0) {
      providersQuery = providersQuery.in("category_id", categoryIds);
    }

    const { data: matchingServices, error: servicesError } = await providersQuery;

    if (servicesError) {
      throw new Error(`Failed to fetch matching providers: ${servicesError.message}`);
    }

    // Get unique provider IDs
    const providerIds = [...new Set(matchingServices?.map(s => s.provider_id) || [])];

    if (providerIds.length === 0) {
      console.log("No matching providers found for this job category");
      return new Response(
        JSON.stringify({ success: true, message: "No matching providers found", notifiedCount: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${providerIds.length} providers with matching services`);

    // Exclude the job poster from notifications (in case they're also a provider)
    const eligibleProviderIds = providerIds.filter(id => id !== job.posted_by);

    // Fetch provider profiles with subscription status and notification preferences
    const { data: providers } = await supabase
      .from("profiles")
      .select("id, full_name, email, subscription_status")
      .in("id", eligibleProviderIds)
      .eq("is_suspended", false);

    if (!providers || providers.length === 0) {
      console.log("No eligible providers found");
      return new Response(
        JSON.stringify({ success: true, message: "No eligible providers found", notifiedCount: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check notification preferences (including job_lead_max_distance)
    const { data: notificationPrefs } = await supabase
      .from("notification_preferences")
      .select("user_id, email_enabled, quote_requests, job_lead_max_distance")
      .in("user_id", eligibleProviderIds);

    const prefsMap = new Map(notificationPrefs?.map(p => [p.user_id, p]) || []);

    // Fetch provider locations for distance filtering
    const { data: providerLocations } = await supabase
      .from("provider_locations")
      .select("provider_id, latitude, longitude, is_primary")
      .in("provider_id", eligibleProviderIds);

    // Create a map of provider primary locations
    const locationMap = new Map<string, { latitude: number; longitude: number }>();
    providerLocations?.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        // Prefer primary location, otherwise use first available
        if (loc.is_primary || !locationMap.has(loc.provider_id)) {
          locationMap.set(loc.provider_id, {
            latitude: Number(loc.latitude),
            longitude: Number(loc.longitude)
          });
        }
      }
    });

    // Filter providers by distance using each provider's preferred max distance
    let filteredProviders = providers;
    if (job.latitude && job.longitude) {
      filteredProviders = providers.filter(provider => {
        const providerLoc = locationMap.get(provider.id);
        if (!providerLoc) return true; // Include if no location set (they might serve anywhere)
        
        // Get provider's preferred max distance (default to 50 miles)
        const prefs = prefsMap.get(provider.id);
        const providerMaxDistance = prefs?.job_lead_max_distance ?? 50;
        
        const distance = calculateDistance(
          Number(job.latitude),
          Number(job.longitude),
          providerLoc.latitude,
          providerLoc.longitude
        );
        
        return distance <= providerMaxDistance;
      });
    }

    console.log(`${filteredProviders.length} providers within their preferred distance`);

    // Prepare email content
    const siteUrl = Deno.env.get('SITE_URL') || 'https://kluje.com';
    const budgetText = job.budget_min && job.budget_max 
      ? `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`
      : job.budget_min 
        ? `From $${job.budget_min.toLocaleString()}`
        : job.budget_max 
          ? `Up to $${job.budget_max.toLocaleString()}`
          : "Flexible";

    let notifiedCount = 0;
    const errors: string[] = [];

    // Send emails to each provider
    for (const provider of filteredProviders) {
      // Check notification preferences (default to enabled if not set)
      const prefs = prefsMap.get(provider.id);
      if (prefs && (!prefs.email_enabled || !prefs.quote_requests)) {
        console.log(`Skipping ${provider.id} - notifications disabled`);
        continue;
      }

      // Get email - fallback to auth if not in profile
      let email = provider.email;
      if (!email) {
        const { data: authData } = await supabase.auth.admin.getUserById(provider.id);
        email = authData?.user?.email;
      }

      if (!email) {
        console.log(`No email found for provider ${provider.id}`);
        continue;
      }

      // Check if provider has active subscription (optional - you might want to notify free users too)
      const isSubscribed = provider.subscription_status === 'active';

      const providerName = provider.full_name?.split(' ')[0] || 'there';
      
      // Calculate distance for email content
      let distanceText = '';
      if (job.latitude && job.longitude) {
        const providerLoc = locationMap.get(provider.id);
        if (providerLoc) {
          const distance = calculateDistance(
            Number(job.latitude),
            Number(job.longitude),
            providerLoc.latitude,
            providerLoc.longitude
          );
          distanceText = `${distance.toFixed(1)} miles from your location`;
        }
      }

      const subject = `🔔 New Job Lead: ${job.title}`;

      const jobSummary = EmailJobSummary({
        title: job.title,
        category: categoryName,
        location: job.location || undefined,
        budget: budgetText,
      });

      const distanceInfo = distanceText ? EmailHighlightBox({
        content: `📍 This job is approximately ${distanceText}`,
        variant: 'info',
      }) : '';

      const subscriptionNote = !isSubscribed ? EmailHighlightBox({
        content: 'Upgrade to a Pro subscription to request quotes and connect with customers directly.',
        variant: 'warning',
        icon: '⭐',
      }) : '';

      const htmlContent = buildEmail({
        header: {
          title: '🔔 New Job Lead!',
          subtitle: 'A job matching your services has been posted',
          variant: 'provider'
        },
        greeting: providerName,
        intro: `Great news! A new job has been posted that matches your listed services. ${isSubscribed ? 'Login to your dashboard to request a quote and win this job!' : 'Upgrade to Pro to request quotes!'}`,
        sections: [
          EmailSectionHeading('📋 Job Details'),
          jobSummary,
          distanceInfo,
          subscriptionNote,
        ].filter(Boolean),
        buttons: [
          { href: `${siteUrl}/dashboard?tab=jobs`, text: isSubscribed ? 'Request Quote' : 'View Job' },
        ],
        footer: "You're receiving this email because you have job lead notifications enabled. Manage your preferences in your dashboard settings.",
      });

      try {
        const emailResponse = await sendEmail(email, subject, htmlContent);
        console.log(`Email sent to ${email}:`, emailResponse?.id);

        await trackEmailNotification(
          supabase, provider.id, email, 'job_lead', jobId, 'job_listing',
          subject, 'sent', emailResponse?.id
        );

        notifiedCount++;
      } catch (emailError: any) {
        console.error(`Failed to send email to ${email}:`, emailError.message);
        errors.push(`${email}: ${emailError.message}`);

        await trackEmailNotification(
          supabase, provider.id, email, 'job_lead', jobId, 'job_listing',
          subject, 'error', undefined, emailError.message
        );
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Job lead notifications complete: ${notifiedCount} sent, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Job lead notifications sent successfully`,
        notifiedCount,
        totalMatched: filteredProviders.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-job-lead-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 10; // Process 10 jobs per run to avoid rate limits

async function sendNotification(supabaseUrl: string, anonKey: string, jobId: string, success: boolean, location?: string, error?: string) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-geocoding-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ jobId, success, location, error }),
    });
    
    if (!response.ok) {
      console.error(`Failed to send notification for job ${jobId}:`, await response.text());
    } else {
      console.log(`Notification sent for job ${jobId}`);
    }
  } catch (err) {
    console.error(`Error sending notification for job ${jobId}:`, err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const mapboxToken = Deno.env.get("MAPBOX_PUBLIC_TOKEN");

    if (!mapboxToken) {
      console.error("MAPBOX_PUBLIC_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Mapbox token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch jobs that have a location but no coordinates
    const { data: jobs, error: fetchError } = await supabase
      .from("job_listings")
      .select("id, location")
      .not("location", "is", null)
      .is("latitude", null)
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error("Error fetching jobs:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs", details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobs || jobs.length === 0) {
      console.log("No jobs to geocode");
      return new Response(
        JSON.stringify({ message: "No jobs to geocode", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${jobs.length} jobs to geocode`);

    let successCount = 0;
    let failCount = 0;
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const job of jobs) {
      if (!job.location) continue;

      try {
        // Geocode the location
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(job.location)}.json?access_token=${mapboxToken}&country=gb&limit=1`
        );

        if (!response.ok) {
          console.error(`Mapbox API error for job ${job.id}: ${response.status}`);
          results.push({ id: job.id, success: false, error: `API error: ${response.status}` });
          failCount++;
          continue;
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;

          // Update the job with coordinates
          const { error: updateError } = await supabase
            .from("job_listings")
            .update({ latitude, longitude })
            .eq("id", job.id);

          if (updateError) {
            console.error(`Failed to update job ${job.id}:`, updateError);
            results.push({ id: job.id, success: false, error: updateError.message });
            failCount++;
            await sendNotification(supabaseUrl, supabaseAnonKey, job.id, false, undefined, updateError.message);
          } else {
            console.log(`Geocoded job ${job.id}: ${latitude}, ${longitude}`);
            results.push({ id: job.id, success: true });
            successCount++;
            await sendNotification(supabaseUrl, supabaseAnonKey, job.id, true, job.location);
          }
        } else {
          console.log(`No geocoding results for job ${job.id}: ${job.location}`);
          // Set coordinates to 0,0 to mark as processed (couldn't geocode)
          await supabase
            .from("job_listings")
            .update({ latitude: 0, longitude: 0 })
            .eq("id", job.id);
          results.push({ id: job.id, success: false, error: "Location not found" });
          failCount++;
          await sendNotification(supabaseUrl, supabaseAnonKey, job.id, false, job.location, "Location not found");
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Error processing job ${job.id}:`, message);
        results.push({ id: job.id, success: false, error: message });
        failCount++;
      }
    }

    console.log(`Batch geocoding complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Batch geocoding complete",
        total: jobs.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Batch geocode error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

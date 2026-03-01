import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

const BASE_URL = 'https://kluje.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Static pages
    const staticPages = [
      { loc: '/', changefreq: 'daily', priority: '1.0' },
      { loc: '/browse-providers', changefreq: 'daily', priority: '0.8' },
      { loc: '/jobs', changefreq: 'daily', priority: '0.8' },
      { loc: '/post-job', changefreq: 'weekly', priority: '0.8' },
      { loc: '/ask-expert', changefreq: 'daily', priority: '0.8' },
      { loc: '/how-it-works', changefreq: 'monthly', priority: '0.8' },
      { loc: '/pricing', changefreq: 'monthly', priority: '0.8' },
      { loc: '/blog', changefreq: 'daily', priority: '0.8' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
      { loc: '/terms', changefreq: 'yearly', priority: '0.4' },
      { loc: '/privacy', changefreq: 'yearly', priority: '0.4' },
      { loc: '/auth', changefreq: 'monthly', priority: '0.5' },
      // Category landing pages
      { loc: '/services/home-diy-renovation', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/commercial-services', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/events-catering', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/health-fitness', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/agriculture', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/pets-services', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/business-services', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/it-services', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/legal-services', changefreq: 'weekly', priority: '0.8' },
      { loc: '/services/lessons', changefreq: 'weekly', priority: '0.8' },
    ];

    // Fetch published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (blogError) {
      console.error('Error fetching blog posts:', blogError);
    }

    // Fetch service providers (users with provider role)
    const { data: providers, error: providersError } = await supabase
      .from('user_roles')
      .select('user_id, created_at')
      .eq('role', 'provider');

    if (providersError) {
      console.error('Error fetching providers:', providersError);
    }

    // Fetch open job listings
    const { data: jobs, error: jobsError } = await supabase
      .from('job_listings')
      .select('id, updated_at, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
    }

    // Fetch expert questions
    const { data: questions, error: questionsError } = await supabase
      .from('expert_questions')
      .select('id, updated_at, created_at')
      .order('created_at', { ascending: false });

    if (questionsError) {
      console.error('Error fetching expert questions:', questionsError);
    }

    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${page.loc}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add blog posts
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at || post.published_at;
        xml += '  <url>\n';
        xml += `    <loc>${BASE_URL}/blog/${post.slug}</loc>\n`;
        if (lastmod) {
          xml += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
        }
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      }
    }

    // Add service provider profiles
    if (providers && providers.length > 0) {
      for (const provider of providers) {
        xml += '  <url>\n';
        xml += `    <loc>${BASE_URL}/service-provider/${provider.user_id}</loc>\n`;
        if (provider.created_at) {
          xml += `    <lastmod>${new Date(provider.created_at).toISOString().split('T')[0]}</lastmod>\n`;
        }
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      }
    }

    // Add job listings
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        const lastmod = job.updated_at || job.created_at;
        xml += '  <url>\n';
        xml += `    <loc>${BASE_URL}/jobs/${job.id}</loc>\n`;
        if (lastmod) {
          xml += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
        }
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      }
    }

    // Add expert questions
    if (questions && questions.length > 0) {
      for (const question of questions) {
        const lastmod = question.updated_at || question.created_at;
        xml += '  <url>\n';
        xml += `    <loc>${BASE_URL}/ask-expert/${question.id}</loc>\n`;
        if (lastmod) {
          xml += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
        }
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    console.log(`Generated sitemap with ${staticPages.length} static pages, ${blogPosts?.length || 0} blog posts, ${providers?.length || 0} providers, ${jobs?.length || 0} jobs, ${questions?.length || 0} expert questions`);

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>`,
      { headers: corsHeaders, status: 500 }
    );
  }
});

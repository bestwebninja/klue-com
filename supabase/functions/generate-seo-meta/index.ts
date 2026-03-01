import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SeoRequest {
  pageType: string;
  pageTitle: string;
  pageContent?: string;
  category?: string;
  location?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageType, pageTitle, pageContent, category, location } = await req.json() as SeoRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an SEO specialist for Kluje, a US-based platform connecting customers with service providers (contractors, tradespeople, event planners, etc.). Generate Google-compliant SEO metadata.

Rules:
- meta_title: Under 60 characters, include primary keyword, brand name "Kluje" at end
- meta_description: Under 160 characters, compelling, include call-to-action, primary keyword
- keywords: 5-8 relevant long-tail keywords for US service industry
- canonical: The canonical URL path (starting with /)
- Use American English spelling
- Focus on local SEO for US market
- Follow Google's latest SEO guidelines

Return ONLY valid JSON with this exact structure:
{
  "meta_title": "string",
  "meta_description": "string", 
  "keywords": ["string"],
  "canonical": "string"
}`;

    const userPrompt = `Generate SEO metadata for this page:
Page Type: ${pageType}
Page Title: ${pageTitle}
${pageContent ? `Content Summary: ${pageContent.substring(0, 500)}` : ""}
${category ? `Category: ${category}` : ""}
${location ? `Location: ${location}` : ""}
Base URL: https://kluje.com`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    try {
      const seoData = JSON.parse(result);
      return new Response(
        JSON.stringify({ success: true, data: seoData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch {
      return new Response(
        JSON.stringify({ success: true, data: { raw: result } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("SEO meta generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

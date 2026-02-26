import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlogAIRequest {
  action: "generate" | "improve" | "seo" | "edit";
  content?: string;
  title?: string;
  topic?: string;
  keywords?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, title, topic, keywords } = await req.json() as BlogAIRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate":
        systemPrompt = `You are a professional blog content writer for Kluje, a UK-based platform connecting customers with service providers. Write engaging, informative, and SEO-optimized blog articles. 
        
Guidelines:
- Use British English spelling
- Write in a friendly, professional tone
- Include practical tips and actionable advice
- Structure content with clear headings (use ## for H2, ### for H3)
- Aim for 800-1200 words
- Include a compelling introduction and conclusion`;
        userPrompt = `Write a complete blog article about: "${topic}"${keywords?.length ? `\n\nFocus on these keywords: ${keywords.join(", ")}` : ""}`;
        break;

      case "improve":
        systemPrompt = `You are an expert content editor. Your task is to improve the given blog content by:
- Enhancing clarity and readability
- Fixing grammar and punctuation
- Improving sentence structure and flow
- Adding relevant subheadings if needed
- Making the content more engaging
- Using British English spelling

Return the improved content maintaining the same format.`;
        userPrompt = `Please improve this blog content:\n\n${content}`;
        break;

      case "seo":
        systemPrompt = `You are an SEO expert. Analyze the given blog content and provide SEO improvements. Return a JSON object with the following structure:
{
  "meta_title": "SEO-optimized title under 60 characters",
  "meta_description": "Compelling meta description under 160 characters",
  "meta_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "improved_title": "SEO-optimized blog title",
  "improved_excerpt": "Engaging excerpt under 200 characters"
}

Focus on UK-based service industry terms.`;
        userPrompt = `Analyze this blog post and provide SEO recommendations:\n\nTitle: ${title}\n\nContent: ${content}`;
        break;

      case "edit":
        systemPrompt = `You are an expert content editor and rewriter. Your task is to:
- Rewrite and improve the given content based on the instructions
- Maintain the core message while enhancing quality
- Use British English spelling
- Keep proper markdown formatting

Return only the edited content, no explanations.`;
        userPrompt = `${topic}\n\nOriginal content:\n${content}`;
        break;

      default:
        throw new Error("Invalid action specified");
    }

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
        ...(action === "seo" && {
          response_format: { type: "json_object" }
        }),
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
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (action === "seo") {
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
    }

    return new Response(
      JSON.stringify({ success: true, content: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Blog AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

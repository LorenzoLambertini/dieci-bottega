// Supabase Edge Function — capture-lead
// Called by embed.js when a contact form is submitted on diecibottega.it

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://diecibottega.it",
  "https://www.diecibottega.it",
  "http://localhost:3000",
];

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
});

interface QuizRecommendation {
  product: string;
  tier:    string;
  price:   string;
  time:    string;
  reason?: string;
}

interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  budget?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  page_url?: string;
  recommendation?: QuizRecommendation;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const cors = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Validation
  if (!body.name?.trim() || !body.email?.trim()) {
    return new Response(
      JSON.stringify({ error: "name and email are required" }),
      { status: 422, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  if (!isValidEmail(body.email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 422,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Anti-spam: block known disposable domains (basic list)
  const disposable = ["mailinator.com", "guerrillamail.com", "temp-mail.org", "throwam.com"];
  const emailDomain = body.email.split("@")[1]?.toLowerCase();
  if (disposable.includes(emailDomain ?? "")) {
    return new Response(JSON.stringify({ error: "Disposable email not allowed" }), {
      status: 422,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Upsert lead (on conflict with email, update score + metadata)
  const metadata: Record<string, unknown> = {};
  if (body.message)        metadata.message        = body.message;
  if (body.page_url)       metadata.page_url       = body.page_url;
  if (body.budget)         metadata.budget         = body.budget;
  if (body.recommendation) metadata.recommendation = body.recommendation;

  // Score boost: leads from quiz have stronger intent (+15)
  const baseScore  = body.recommendation ? 25 : 10;

  const { data: lead, error } = await supabase
    .from("leads")
    .upsert(
      {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() ?? null,
        company: body.company?.trim() ?? null,
        status: "new",
        source: body.source ?? "website",
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        score: baseScore,
        metadata,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
        ignoreDuplicates: false,
      }
    )
    .select("id, email")
    .single();

  if (error) {
    console.error("lead upsert error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save lead" }),
      { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  // Log activity (lead acquisito)
  await supabase.from("activities").insert({
    lead_id: lead.id,
    user_id: null,
    type:    "system",
    subject: "Lead acquisito via sito web",
    body:    body.message ?? null,
    metadata: {
      source:   body.source ?? "website",
      page_url: body.page_url ?? null,
    },
  });

  // If lead came from quiz, log a second activity with the recommendation
  if (body.recommendation) {
    await supabase.from("activities").insert({
      lead_id: lead.id,
      user_id: null,
      type:    "note",
      subject: `Quiz: consigliato ${body.recommendation.product}`,
      body:    [
        `Tier: ${body.recommendation.tier}`,
        `Prezzo indicativo: ${body.recommendation.price}`,
        `Consegna: ${body.recommendation.time}`,
        body.recommendation.reason ? `\nRagione: "${body.recommendation.reason}"` : "",
      ].filter(Boolean).join("\n"),
      metadata: { recommendation: body.recommendation },
    });
  }

  // Trigger workflows — find active workflows with trigger "lead_created"
  const { data: workflows } = await supabase
    .from("workflows")
    .select("id, name, actions, conditions")
    .eq("trigger", "lead_created")
    .eq("is_active", true);

  if (workflows?.length) {
    for (const wf of workflows) {
      // Simple condition check: currently supports source matching
      const conditions = (wf.conditions as Record<string, unknown>) ?? {};
      let conditionsMet = true;

      if (conditions.source && conditions.source !== body.source) {
        conditionsMet = false;
      }

      if (conditionsMet) {
        // Increment run count
        await supabase
          .from("workflows")
          .update({ run_count: supabase.rpc("run_count + 1" as never) })
          .eq("id", wf.id);

        // Execute actions (basic: send_email via Resend, assign_to)
        const actions = Array.isArray(wf.actions) ? wf.actions : [];
        for (const action of actions as Record<string, unknown>[]) {
          if (action.type === "assign_to" && action.user_id) {
            await supabase
              .from("leads")
              .update({ assigned_to: action.user_id as string })
              .eq("id", lead.id);
          }

          if (action.type === "add_tag" && action.tag_id) {
            await supabase.from("lead_tags").upsert({
              lead_id: lead.id,
              tag_id: action.tag_id as string,
            });
          }
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true, id: lead.id }),
    {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    }
  );
});

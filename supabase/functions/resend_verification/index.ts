// supabase/functions/resend_verification/index.ts
import { serve } from "std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();
    const email = body?.email;
    if (!email) return new Response(JSON.stringify({ error: 'email required' }), { status: 400 });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate a signup/verification link (admin) — returns action link info
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup", // 'signup' -> verification link
      email
      // you can pass password or other options if needed
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // data.properties.action_link is usually the link — send it via Resend or let Supabase send built-in email.
    // If you want to send via Resend: call Resend API here with data.properties.action_link

    return new Response(JSON.stringify({ success: true, link: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

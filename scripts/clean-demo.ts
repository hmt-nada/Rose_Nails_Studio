import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if not already populated in process.env
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error(
    "Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false },
});

async function clean() {
  console.log("🧹 Deleting all reservations with [demo] notes...");

  const { data, error } = await supabase
    .from("reservations")
    .delete()
    .ilike("note", "[demo]%")
    .select("id");

  if (error) {
    console.error("Cleanup error:", error.message);
    process.exit(1);
  }

  const count = data ? data.length : 0;
  console.log(`✅ Cleaned up ${count} demo reservation(s). All production records remain untouched.`);
}

clean().catch((err) => {
  console.error("Clean execution failed:", err);
  process.exit(1);
});

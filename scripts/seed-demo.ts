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

const FAKE_NAMES = [
  "Emma Watson",
  "Olivia Smith",
  "Sophia Davis",
  "Ava Johnson",
  "Isabella Brown",
  "Charlotte Wilson",
  "Amelia Taylor",
  "Mia Anderson",
  "Harper Thomas",
  "Evelyn Martinez",
  "Abigail Jackson",
  "Emily White",
  "Ella Harris",
  "Chloe Martin",
  "Grace Thompson",
  "Victoria Robinson",
  "Lily Clark",
  "Hannah Rodriguez",
  "Zoey Lewis",
  "Penelope Lee",
  "Scarlett Walker",
  "Layla Hall",
  "Riley Allen",
  "Nora Young",
  "Hazel King",
  "Ellie Wright",
  "Aurora Scott",
  "Violet Green",
  "Stella Adams",
  "Maya Baker",
];

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
  "5:30 PM",
];

const DEMO_NOTES = [
  "[demo] First time client, prefers delicate almond shaping.",
  "[demo] Requested high-gloss chrome glaze finish.",
  "[demo] Delicate minimalist nail art on ring fingers.",
  "[demo] Requested extra nourishing cuticle oil and massage.",
  "[demo] Regular 3-week maintenance and gel refill.",
  "[demo] French tip with soft baby pink base.",
  "[demo] BIAB overlay for natural nail strength.",
  "[demo] Special occasion set for weekend event.",
  "[demo] Likes clean neutral and soft nude palettes.",
  "[demo] Requested short oval active length.",
];

async function seed() {
  console.log("🌱 Fetching services from Supabase...");

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, name, price")
    .eq("active", true)
    .order("position", { ascending: true });

  if (servicesError || !services || services.length === 0) {
    console.error("Failed to load services:", servicesError?.message || "No services found.");
    process.exit(1);
  }

  console.log(`Found ${services.length} active studio services.`);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();

  const reservationsToInsert = [];
  let phoneCounter = 100;

  // We want about 60 realistic fake reservations spread across the last 8 months:
  // Month offset -7 up to 0 (8 months total)
  for (let monthOffset = -7; monthOffset <= 0; monthOffset++) {
    const targetDate = new Date(currentYear, currentMonth + monthOffset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    // Approximately 7 to 9 reservations per month (total ~60)
    const countThisMonth = monthOffset === 0 ? 10 : Math.floor(Math.random() * 3) + 7;

    for (let i = 0; i < countThisMonth; i++) {
      phoneCounter++;
      const clientName = FAKE_NAMES[(phoneCounter + i) % FAKE_NAMES.length];
      const service = services[(phoneCounter + i) % services.length];
      const time = TIME_SLOTS[i % TIME_SLOTS.length];
      const note = DEMO_NOTES[(phoneCounter + i) % DEMO_NOTES.length];
      const phone = `+213 555 010 ${String(phoneCounter % 1000).padStart(3, "0")}`;

      // Calculate day of month
      let day: number;
      let status: "completed" | "cancelled" | "confirmed" | "new";

      if (monthOffset < 0) {
        // Past months: spread throughout days 1-28
        day = Math.min(28, (i * 3 + 2) % 28 + 1);
        // Mostly completed in the past, occasional cancelled
        status = i % 8 === 0 ? "cancelled" : "completed";
      } else {
        // Current month
        if (i < 4) {
          // Days before today in current month
          day = Math.max(1, currentDay - (4 - i) * 2);
          status = i === 1 ? "cancelled" : "completed";
        } else if (i === 4 || i === 5) {
          // Today or tomorrow
          day = i === 4 ? currentDay : Math.min(28, currentDay + 1);
          status = "confirmed";
        } else {
          // Future days in current month
          day = Math.min(28, currentDay + (i - 4) * 2);
          status = i % 2 === 0 ? "new" : "confirmed";
        }
      }

      const yStr = String(targetYear);
      const mStr = String(targetMonth + 1).padStart(2, "0");
      const dStr = String(day).padStart(2, "0");
      const dateStr = `${yStr}-${mStr}-${dStr}`;

      const createdDate = new Date(targetYear, targetMonth, Math.max(1, day - 2), 10, 0, 0);

      reservationsToInsert.push({
        name: clientName,
        phone,
        service_id: service.id,
        service: service.name,
        price: service.price,
        date: dateStr,
        time,
        note,
        status,
        created_at: createdDate.toISOString(),
      });
    }
  }

  console.log(`Inserting ${reservationsToInsert.length} demo reservations with [demo] notes...`);

  // Insert in batches of 20
  for (let i = 0; i < reservationsToInsert.length; i += 20) {
    const batch = reservationsToInsert.slice(i, i + 20);
    const { error: insertError } = await supabase
      .from("reservations")
      .insert(batch);

    if (insertError) {
      console.error("Batch insert error:", insertError.message);
      process.exit(1);
    }
  }

  console.log(`✅ Successfully seeded ${reservationsToInsert.length} demo reservations!`);
  console.log("Run `npm run seed:demo:clean` anytime to delete all rows marked with [demo].");
}

seed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});

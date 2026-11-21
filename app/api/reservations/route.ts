import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BOOKING_TIME_SLOTS } from "@/lib/constants";

// ── In-Memory Rate Limiter (Max 5 requests per 10 minutes per IP) ──
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 5;

  // Periodic pruning of expired entries to prevent memory growth
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count += 1;
  return false;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

// ── Validation Schema (Zod 4) ──
const reservationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be between 2 and 80 characters")
    .max(80, "Name must be between 2 and 80 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s\-()]+$/, "Phone number contains invalid characters")
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    }, "Phone number must contain between 8 and 15 digits"),
  service_id: z
    .string()
    .trim()
    .uuid("Please select a valid service"),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .refine((val) => {
      const [year, month, day] = val.split("-").map(Number);
      const selected = new Date(year, month - 1, day);
      if (isNaN(selected.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, "Date must be today or in the future"),
  time: z.enum(BOOKING_TIME_SLOTS, {
    message: "Please select a valid time slot",
  }),
  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  honeypot: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    // 1. In-memory Rate Limit Check
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many booking requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // 2. Parse and Validate Request Body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const validation = reservationSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues?.[0]?.message || "Invalid reservation data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = validation.data;

    // 3. Honeypot check: If bot filled the hidden honeypot, silently return success without saving
    if (data.honeypot && data.honeypot.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    // 4. Look up service server-side: must exist and be active
    const { data: serviceRecord, error: serviceError } = await supabaseAdmin
      .from("services")
      .select("id, name, price, active")
      .eq("id", data.service_id)
      .maybeSingle();

    if (serviceError || !serviceRecord || !serviceRecord.active) {
      return NextResponse.json(
        { error: "The selected service is invalid or no longer available. Please choose another service." },
        { status: 400 }
      );
    }

    // 5. Check for existing active reservation for the same date and time
    const { data: existing, error: queryError } = await supabaseAdmin
      .from("reservations")
      .select("id")
      .eq("date", data.date)
      .eq("time", data.time)
      .neq("status", "cancelled")
      .limit(1);

    if (queryError) {
      console.error("Database lookup error:", queryError.message);
      return NextResponse.json(
        { error: "Unable to verify time slot availability. Please try again." },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "This time slot is already booked, please choose another one" },
        { status: 409 }
      );
    }

    // 6. Insert new reservation storing service_id, name, and PRICE FROM DATABASE (never trusted from client)
    const { error: insertError } = await supabaseAdmin.from("reservations").insert({
      name: data.name,
      phone: data.phone,
      service_id: serviceRecord.id,
      service: serviceRecord.name,
      price: serviceRecord.price,
      date: data.date,
      time: data.time,
      note: data.note,
      status: "new",
    });

    if (insertError) {
      console.error("Database insert error:", insertError.message);
      return NextResponse.json(
        { error: "An error occurred while confirming your reservation. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected reservation error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}

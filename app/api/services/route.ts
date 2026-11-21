import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface ServiceRecord {
  id: string;
  name: string;
  price: number;
  duration_min: number;
  active: boolean;
  position: number;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("id, name, price, duration_min, active, position")
      .eq("active", true)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching services:", error.message);
      return NextResponse.json(
        { error: "Failed to load services" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Unexpected error in GET /api/services:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const statusSchema = z.object({
  status: z.enum(["new", "confirmed", "completed", "cancelled"], {
    message: "Invalid reservation status",
  }),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify authenticated admin user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing reservation id." },
        { status: 400 }
      );
    }

    // 2. Parse & validate request body
    const body = await request.json();
    const validation = statusSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues?.[0]?.message || "Invalid status payload";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { status } = validation.data;

    // 3. Update reservation status in Supabase
    const { data, error: updateError } = await supabaseAdmin
      .from("reservations")
      .update({ status })
      .eq("id", id)
      .select("id, name, phone, service, price, date, time, note, status, created_at")
      .single();

    if (updateError) {
      console.error("Status update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update reservation status in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reservation: data });
  } catch (err) {
    console.error("Unexpected error in reservation patch route:", err);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}

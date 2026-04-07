import bcrypt from "bcryptjs";
import { newRowId, getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = newRowId();
    const now = new Date().toISOString();

    const { data: user, error } = await supabase
      .from("User")
      .insert({
        id,
        email,
        passwordHash,
        createdAt: now,
      })
      .select("id, email")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An account with that email already exists." },
          { status: 409 },
        );
      }
      throw error;
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.json(
      {
        error:
          "Cannot reach the database right now. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }
}

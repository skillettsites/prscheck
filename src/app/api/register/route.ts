import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, councilName, role } = body;

    // Basic validation
    if (!name || !email || !councilName || !role) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // TODO: Connect to database (Supabase) to persist registrations
    // TODO: Send confirmation email via Resend
    // TODO: Notify team via Slack/email

    console.log("[PRSCheck] New registration:", {
      name,
      email,
      councilName,
      role,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Registration received successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

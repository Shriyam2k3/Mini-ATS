import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

/**
 * Secure Admin Provisioning Endpoint
 * Requires the ADMIN_PROVISION_SECRET environment variable.
 * Used for initial administrative setup without exposing public escalation.
 */
export async function POST(req: NextRequest) {
  try {
    const adminSecret = process.env.ADMIN_PROVISION_SECRET;
    if (!adminSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin provisioning is disabled on this server (no secret key configured).",
        },
        { status: 503 }
      );
    }

    const authHeader = req.headers.get("x-admin-secret");
    const body = await req.json().catch(() => ({}));
    const providedSecret = authHeader || body.secret;

    if (!providedSecret || providedSecret !== adminSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid admin provisioning secret key." },
        { status: 403 }
      );
    }

    const { email, name, password, action = "promote" } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Target email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    await connectToDatabase();

    let user = await User.findOne({ email: normalizedEmail });

    if (action === "create") {
      if (user) {
        user.role = "ADMIN";
        await user.save();
        return NextResponse.json({
          success: true,
          message: `Existing user ${normalizedEmail} successfully promoted to ADMIN.`,
          user: { id: user._id.toString(), email: user.email, role: user.role },
        });
      }

      if (!password) {
        return NextResponse.json(
          { success: false, error: "Password is required when creating a new admin user." },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user = await User.create({
        name: name || "ATS Administrator",
        email: normalizedEmail,
        password: hashedPassword,
        role: "ADMIN",
      });

      return NextResponse.json({
        success: true,
        message: `Admin user ${normalizedEmail} created successfully.`,
        user: { id: user._id.toString(), email: user.email, role: user.role },
      });
    }

    // Default action: promote existing user
    if (!user) {
      return NextResponse.json(
        { success: false, error: `User with email ${normalizedEmail} not found.` },
        { status: 404 }
      );
    }

    user.role = "ADMIN";
    await user.save();

    return NextResponse.json({
      success: true,
      message: `User ${normalizedEmail} successfully promoted to ADMIN.`,
      user: { id: user._id.toString(), email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error("Admin provision error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during admin provisioning." },
      { status: 500 }
    );
  }
}

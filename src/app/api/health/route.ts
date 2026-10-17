import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let dbStatus = "disconnected";
    try {
      await connectToDatabase();
      dbStatus = mongoose.connection.readyState === 1 ? "connected" : "connecting";
    } catch {
      dbStatus = "error";
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "EarlyJobs.ai Mini ATS",
      database: dbStatus,
      uptime: process.uptime(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Health check failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasGoogle = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  );
  const hasGithub = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
  );

  return NextResponse.json({
    google: hasGoogle,
    github: hasGithub,
  });
}

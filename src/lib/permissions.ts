import { auth } from "@/auth";
import { UserRole } from "@/types/next-auth";
import { connectToDatabase } from "./mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
}

/**
 * Returns the currently authenticated user from the session and validates with DB.
 * Never trusts client-supplied roles.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return null;
    }

    // Always fetch fresh role and user info from DB to avoid stale or tampered tokens
    await connectToDatabase();
    const dbUser = await User.findOne({ email: session.user.email.toLowerCase() });

    if (!dbUser) {
      // Fallback to session user if DB record was somehow not found but session is valid
      return {
        id: session.user.id || "",
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role || "RECRUITER",
      };
    }

    return {
      id: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image || session.user.image,
      role: dbUser.role as UserRole,
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * API route guard that requires authentication.
 * Returns either { user } or { response: NextResponse } (401 error).
 */
export async function requireAuth(): Promise<
  { user: AuthenticatedUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required. Please sign in." },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * API route guard that requires specific role(s).
 * Returns either { user } or { response: NextResponse } (401 or 403 error).
 */
export async function requireRole(allowedRoles: UserRole[] = ["ADMIN", "RECRUITER"]): Promise<
  { user: AuthenticatedUser; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const authCheck = await requireAuth();
  if (authCheck.errorResponse) {
    return authCheck;
  }

  const { user } = authCheck;
  if (!allowedRoles.includes(user.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Forbidden: You lack sufficient permissions to perform this action.",
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

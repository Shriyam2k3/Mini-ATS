import { DefaultSession } from "next-auth";

export type UserRole = "ADMIN" | "RECRUITER";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

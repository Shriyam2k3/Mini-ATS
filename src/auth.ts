import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { UserRole } from "@/types/next-auth";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [];

// 1. Google OAuth Provider (Enabled when credentials are provided in env)
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

// 2. GitHub OAuth Provider (Optional second provider)
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

// 3. Credentials Provider (Secure email/password for local testing & recruiters)
providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      const email = (credentials.email as string).toLowerCase().trim();
      const password = credentials.password as string;

      await connectToDatabase();

      // Find user and explicitly select hidden password field
      const user = await User.findOne({ email }).select("+password");

      if (!user || !user.password) {
        // Generic error to avoid account enumeration
        throw new Error("Invalid email or password");
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        throw new Error("Invalid email or password");
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers,
  // Note: JWT strategy is required when Credentials Provider is enabled alongside OAuth.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Handle OAuth sign-ins (Google / GitHub)
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectToDatabase();
          const normalizedEmail = user.email.toLowerCase().trim();
          let existingUser = await User.findOne({ email: normalizedEmail });

          if (!existingUser) {
            // New user registration defaults strictly to RECRUITER role
            existingUser = await User.create({
              name: user.name || (account.provider === "github" ? "GitHub Recruiter" : "Google Recruiter"),
              email: normalizedEmail,
              image: user.image,
              role: "RECRUITER",
            });
          } else {
            // NEVER overwrite existing role. Update image if missing
            if (user.image && !existingUser.image) {
              existingUser.image = user.image;
              await existingUser.save();
            }
          }

          user.role = existingUser.role;
          user.id = existingUser._id.toString();
          return true;
        } catch (error) {
          console.error("Error saving OAuth user:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) || "RECRUITER";
      }

      // If user profile is updated
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as UserRole) || "RECRUITER";
      }
      return session;
    },
  },
});

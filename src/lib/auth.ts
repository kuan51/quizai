import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import { logger } from "./logger";

// Runtime validation: ensure NEXTAUTH_SECRET is set in production (OWASP A07:2021)
// Skip during Next.js build phase (module is evaluated but auth isn't used)
if (
  !process.env.NEXTAUTH_SECRET &&
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PHASE
) {
  throw new Error(
    "NEXTAUTH_SECRET is required in production. Generate with: openssl rand -base64 32"
  );
}

// Email whitelist: parse once at module load for O(1) lookups
// Fail-closed in production: AUTHORIZED_EMAILS must be set (use "*" to allow all)
const authorizedEmails: Set<string> | null = (() => {
  const raw = process.env.AUTHORIZED_EMAILS?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
      throw new Error(
        "AUTHORIZED_EMAILS is required in production. Set to comma-separated emails, or \"*\" to allow all."
      );
    }
    return null;
  }
  if (raw === "*") return null;
  return new Set(
    raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
})();

function isEmailAuthorized(email: string | null | undefined): boolean {
  if (!authorizedEmails) return true;
  if (!email) return false;
  return authorizedEmails.has(email.toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!isEmailAuthorized(user.email)) {
        logger.security("auth.failed", {
          message: "Sign-in denied: email not in whitelist",
          metadata: { provider: account?.provider },
        });
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      // Persist user id to token on initial sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow any same-origin URL (covers sign-in callbackUrl="/dashboard" and sign-out callbackUrl="/")
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Block cross-origin redirects
      return baseUrl;
    },
  },
  // Security event logging (OWASP A09:2021)
  events: {
    async signIn({ user, account }) {
      logger.security("auth.signin", {
        userId: user.id,
        message: `User signed in via ${account?.provider}`,
        metadata: {
          provider: account?.provider,
        },
      });
    },
    async signOut(message) {
      // Handle both JWT and database session strategies
      const userId = "token" in message && message.token
        ? (message.token.id as string)
        : undefined;
      logger.security("auth.signout", {
        userId,
        message: "User signed out",
      });
    },
    async linkAccount({ user, account }) {
      logger.security("auth.link_account", {
        userId: user.id,
        message: `Account linked: ${account.provider}`,
        metadata: { provider: account.provider },
      });
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (OWASP A07:2021 - explicit session lifetime)
    updateAge: 24 * 60 * 60, // Refresh JWT every 24 hours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // Only trust host in development; in production, verify via NEXTAUTH_URL
  trustHost: process.env.NODE_ENV === "development",
});

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

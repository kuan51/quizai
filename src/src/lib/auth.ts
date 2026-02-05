import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import { logger } from "./logger";

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
      // Redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
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
          email: user.email,
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
      logger.security("auth.signin", {
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

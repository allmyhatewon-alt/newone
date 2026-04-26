import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // JWT works better on Vercel edge than DB sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/hub/onboarding",
    error: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.shards = (user as any).shards;
        token.gems = (user as any).gems;
        token.xp = (user as any).xp;
        token.level = (user as any).level;
        token.gemsUnlocked = (user as any).gemsUnlocked;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).role = token.role as string;
        (session.user as any).shards = token.shards as number;
        (session.user as any).gems = token.gems as number;
        (session.user as any).xp = token.xp as number;
        (session.user as any).level = token.level as number;
        (session.user as any).gemsUnlocked = token.gemsUnlocked as boolean;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            passwordHash: true,
            role: true,
            image: true,
            shards: true,
            gems: true,
            xp: true,
            level: true,
            gemsUnlocked: true,
          },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.image,
          username: user.username,
          role: user.role,
          shards: user.shards,
          gems: user.gems,
          xp: user.xp,
          level: user.level,
          gemsUnlocked: user.gemsUnlocked,
        } as any;
      },
    }),
  ],
};

// Convenience wrapper for server components / route handlers
export function auth() {
  return getServerSession(authOptions);
}

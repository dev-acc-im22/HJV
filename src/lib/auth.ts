import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { UserRole, AccountStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: UserRole;
      isPremium: boolean;
      isVerified: boolean;
      hasProfile: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    isPremium: boolean;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    isPremium: boolean;
    isVerified: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { profile: { select: { id: true } } },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (user.accountStatus === AccountStatus.SUSPENDED) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        if (user.accountStatus === AccountStatus.BANNED) {
          throw new Error("Your account has been banned permanently.");
        }

        if (user.accountStatus === AccountStatus.DEACTIVATED) {
          throw new Error("Your account has been deactivated. Please contact support to reactivate.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.name || user.email.split("@")[0],
          role: user.role,
          isPremium: user.isPremium,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.isPremium = user.isPremium;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Check if user has a profile
        const profile = await db.profile.findUnique({
          where: { userId: token.id },
          select: { id: true },
        });

        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          isPremium: token.isPremium,
          isVerified: token.isVerified,
          hasProfile: !!profile,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

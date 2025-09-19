// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import AzureAD from "next-auth/providers/azure-ad";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // ✅ use your shared client
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } },
    }),
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!, // e.g. "common"
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (!user) return null;
        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) return null;
        return { id: user.id, name: user.name ?? undefined, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // ensure token.sub is set for credentials logins
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      // if you added the next-auth module augmentation, this is typed
      if (token?.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
};

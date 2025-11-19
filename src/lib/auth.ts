// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import Google from "next-auth/providers/google";
import AzureAD from "next-auth/providers/azure-ad";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
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
      tenantId: process.env.AZURE_AD_TENANT_ID!, // e.g., "common"
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = creds?.email?.toLowerCase().trim();
        const password = creds?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
          },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        const name =
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          undefined;
        return { id: user.id, email: user.email, name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // copy user id into token on sign-in
      if (user?.id) {
        (token as JWT).uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // expose id on session.user for server/client use
      if (session.user) {
        const jwt = token as JWT;
        session.user.id = jwt.uid ?? token.sub ?? undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

// ---- Server helper to get the signed-in user (id/email/names) ----
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;

  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
}

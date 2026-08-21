import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { checkRateLimit, getClientIp } from "./rateLimit";

// Only use PrismaAdapter when DB is available
async function getAdapter() {
  if (!prisma) return undefined;
  try {
    const { PrismaAdapter } = await import("@auth/prisma-adapter");
    return PrismaAdapter(prisma);
  } catch {
    return undefined;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(async () => {
  const adapter = await getAdapter();
  return {
    adapter,
    session: { strategy: "jwt" },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    providers: [
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, request) {
          if (!credentials?.email || !credentials?.password) return null;
          if (!prisma) return null;

          const ip = getClientIp(request);
          const email = (credentials.email as string).toLowerCase();
          const ipOk = checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
          const emailOk = checkRateLimit(`login:email:${email}`, 5, 15 * 60 * 1000);
          if (!ipOk || !emailOk) return null;

          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user || !user.password) return null;
            if (!user.isActive) return null;

            const valid = await bcrypt.compare(
              credentials.password as string,
              user.password
            );
            if (!valid) return null;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
            };
          } catch {
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          console.log("[auth debug] jwt callback, user object:", JSON.stringify(user));
          token.role = user.role;
          token.id = user.id;
        }
        console.log("[auth debug] jwt callback, resulting token.role:", token.role);
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.role ?? "CUSTOMER";
          session.user.id = token.id ?? "";
        }
        console.log("[auth debug] session callback, resulting role:", session.user?.role);
        return session;
      },
    },
  };
});

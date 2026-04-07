import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email?.trim() || !password) return null;

        const supabase = getSupabaseAdmin();
        const { data: user, error } = await supabase
          .from("User")
          .select("id, email, name, passwordHash")
          .eq("email", email.trim().toLowerCase())
          .maybeSingle();

        if (error || !user) return null;

        const ok = await bcrypt.compare(
          password,
          user.passwordHash as string,
        );
        if (!ok) return null;

        return {
          id: user.id as string,
          email: user.email as string,
          name: (user.name as string | null) ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
});

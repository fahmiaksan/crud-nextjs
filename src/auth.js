import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { SignInSchema } from "@/lib/zod";
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: '/login',
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Email"
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password"
        },
      },
      authorize: async (credentials) => {
        const validateFields = SignInSchema.safeParse(credentials);
        if (!validateFields.success) {
          return {
            error: validateFields.error.errors[0].message
          }
        }
        const { email, password } = validateFields.data;
        const user = await prisma.teacher.findUnique({ where: { email } });
        let role = "teacher";
        if (!user) {
          user = await prisma.student.findUnique({ where: { email } });
          role = "student";
        }
        if (!user) {
          throw new Error("User not found");
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }
        return {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role
        };
      },
      type: "credentials",
      name: "Credentials"
    }),
  ],
  callbacks: {
    authorized({
      auth, request: {
        nextUrl
      }
    }) {
      const isLoggedIn = !!auth?.user;
      const ProtectedRoutes = ['/dashboard', '/dashboard/student', '/dashboard/teacher', '/dashboard/subject'];
      if (!isLoggedIn && ProtectedRoutes.includes(nextUrl.pathname)) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullname = user.fullname;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    session({ session, token }) {
      session.user = {
        id: token.sub,
        fullname: token.fullname,
        email: token.email,
        role: token.role,
      };
      return session;
    }

  }
});
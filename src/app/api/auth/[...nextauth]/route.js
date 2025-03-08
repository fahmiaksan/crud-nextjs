import { handlers } from "@/auth"; // Referring to the auth.ts we just created
export const { GET, POST } = handlers






















// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import connection from "@/lib/db";
// import bcrypt from "bcrypt";

// const authOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       type: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Email and password are required!");
//         }

//         const { email, password } = credentials;

//         // Ambil data user dari database, termasuk password
//         const [results] = await connection.query(
//           "SELECT * FROM user WHERE email = ?",
//           [email]
//         );

//         if (results.length === 0) {
//           throw new Error("User not found!");
//         }

//         const user = results[0];

//         // Periksa apakah password sesuai
//         const isPasswordCorrect = await bcrypt.compare(password, user.password);

//         if (!isPasswordCorrect) {
//           throw new Error("Invalid email or password!");
//         }


//         delete user.password;

//         return user;
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.fullname = user.fullname;
//         token.email = user.email;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.email = token.email;
//         session.user.fullname = token.fullname;
//         session.user.role = token.role;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

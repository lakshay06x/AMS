// src/pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "../../../utils/db";
import { Employee } from "../../../utils/schemas";
import bcrypt from "bcryptjs";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await connectDB();

        const user = await Employee.findOne({ username: credentials.username });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user._id, name: user.username, isAdmin: user.isAdmin };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.isAdmin = token.isAdmin;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.JWT_SECRET,
});

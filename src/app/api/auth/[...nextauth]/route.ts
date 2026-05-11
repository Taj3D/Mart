import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userName: { label: "User Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.userName || !credentials?.password) {
          throw new Error("User name and password are required")
        }

        const user = await db.user.findUnique({
          where: { userName: credentials.userName },
        })

        if (!user) {
          throw new Error("Invalid user name or password")
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Contact administrator.")
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash)

        if (!isValid) {
          throw new Error("Invalid user name or password")
        }

        // Update last login time
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          name: user.fullName || user.userName,
          email: user.email || user.userName,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "ims-erp-secret-key-change-in-production",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

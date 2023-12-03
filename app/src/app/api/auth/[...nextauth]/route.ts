import userDbClientPromise from "@/lib/auth-db";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const GOOGLE_OAUTH_CLIENT_ID_FILE = "/run/secrets/oauth-google-client-id"
const GOOGLE_OAUTH_CLIENT_SECRET_FILE = "/run/secrets/oauth-google-client-secret"

const handler = NextAuth({
  adapter: MongoDBAdapter(userDbClientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id;
      }
      
      return token;
    },
    async session({ session, user, token }) {
      //user.id = token.id;
      return session;
    },
  },
  debug: true
})

export { handler as GET, handler as POST };
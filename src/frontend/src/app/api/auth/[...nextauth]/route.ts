import userDbClientPromise from "@/lib/auth-db";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    adapter: MongoDBAdapter(userDbClientPromise),
    providers: [
        GoogleProvider({
        clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user?.id) {
                token.id = user.id
            }
            if (user?.name) {
                token.name = user.name;
            }
            if (user?.email) {
                token.email = user.email;
            }

            return token
        },
        async session({ session, token }) {
            if (typeof token.id == "string") {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
            }

            return session;
        },
    },
    debug: true,
    session: {
        strategy: 'jwt'
    },
})

export { handler as GET, handler as POST };
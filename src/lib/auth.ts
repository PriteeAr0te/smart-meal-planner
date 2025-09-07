import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { User as NextAuthUser } from "next-auth";
import { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email ID", type: "email", placeholder: "Enter your email ID" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" },
            },
            async authorize(credentials) {
                if (!credentials?.email ||
                    !credentials?.password) {
                    throw new Error("Please fill all the fields")
                }

                try {
                    const email = (credentials.email as string).toLowerCase().trim();
                    // const password = credentials.password as string;

                    await connectToDatabase();

                    const user = await User.findOne({ email }).select("+password");

                    if (!user) {
                        throw new Error("No user found, please sign up");
                    }

                    const isValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password);

                    if (!isValid) {
                        throw new Error("Invalid password");
                    }
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role
                    }

                } catch (error) {
                    throw error;
                }
            }
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }: { token: JWT, user?: NextAuthUser }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }: { session: Session, token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },

        async signIn({ account, user }) {
            if (account?.provider === 'google') {
                const googleUser = user as NextAuthUser & { email_verified?: boolean };

                if (googleUser.email_verified === true && googleUser.email?.endsWith("@example.com")) {
                    return true;
                } else {
                    return false;
                }
            }

            return true;
        }
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin'
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.AUTH_SECRET,
};

export default NextAuth(authOptions)
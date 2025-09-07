import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { User as NextAuthUser } from "next-auth";
import { Session } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                name: { label: "Name", type: "text", placeholder: "Enter your name" },
                email: { label: "Email ID", type: "email", placeholder: "Enter your email ID" },
                phone: { label: "Mobile Number", type: "text", placeholder: "Enter your mobile number" },
                role: { label: "Role", type: "text", placeholder: "Enter your role" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" },
            },
            async authorize(credentials) {
                if (!credentials?.name ||
                    !credentials?.email ||
                    !credentials?.phone ||
                    !credentials?.role ||
                    !credentials?.password) {
                    throw new Error("Please fill all the fields")
                }

                try {
                    await connectToDatabase();

                    const user = await User.findOne({
                        email: credentials.email
                    });

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

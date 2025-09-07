import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { MongoServerError } from "mongodb";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneCode, phone, email, password, name, role } = body

        if (!phone || !password || !name) {
            return NextResponse.json(
                { error: 'Phone and password are required' },
                { status: 400 },
            )
        }

        if (!phoneCode) {
            return NextResponse.json(
                { error: 'Phone code is required' },
                { status: 400 },
            )
        }

        const fullPhone = `${phoneCode}${phone}`;

        await connectToDatabase();

        const normalizedEmail = email?.toLowerCase().trim();

        const existingUser = await User.findOne({
            $or: [{ phone: fullPhone }, { email: normalizedEmail }]
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 },
            )
        }

        await User.create({
            email: normalizedEmail,
            phone: fullPhone,
            password,
            name,
            role: role || 'member',
        });

        return NextResponse.json(
            { message: "User Created Successfully" },
            { status: 201 },
        )

    } catch (error: unknown) {
        if (error instanceof MongoServerError && error?.code === 11000) {
            return NextResponse.json({ error: "Duplicate field value" }, { status: 409 });
        }

        return NextResponse.json(
            { error: "Failed to create user." },
            { status: 500 }
        )
    }
}
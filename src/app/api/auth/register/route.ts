import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
    try {
        const { phoneCode, phone, email, password, name, role } = await request.json();

        if (!phone || !password || !name) {
            return NextResponse.json(
                { error: 'Phone and password are required' },
                { status: 400 },
            )
        }

        await connectToDatabase();

        const fullPhone = `${phoneCode}${phone}`;

        const existingUser = await User.findOne({ phone: fullPhone });
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 },
            )
        }

        await User.create({
            email,
            phone: fullPhone,
            password,
            name,
            role
        });

        return NextResponse.json(
            { message: "User Created Successfully" },
            { status: 200 },
        )

    } catch (error) {
        console.log("Register error: ", error)
        return NextResponse.json(
            { error: "Failed to create user." },
            { status: 500 }
        )
    }
}
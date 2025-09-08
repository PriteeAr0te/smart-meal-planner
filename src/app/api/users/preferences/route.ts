import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { dietType, allergies, dislikedIngredients } = await request.json();

        if (!dietType) {
            return NextResponse.json({ error: 'Diet type is required' }, { status: 400 });
        }

        await connectToDatabase();

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            {
                $set: {
                    'preferences.dietType': dietType,
                    'preferences.allergies': allergies || [],
                    'preferences.dislikedIngredients': dislikedIngredients || [],
                },
            }, { new: true }
        ).select('preferences');

        return NextResponse.json(
            { message: 'Preferences updated successfully', preferences: updatedUser?.preferences },
            { status: 200 }
        )

    } catch (error: unknown) {
        console.log("Error updating preferences:", error);
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        )
    }
}
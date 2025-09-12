import crypto from 'crypto';
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Household from "@/models/Household";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Invitation from '@/models/Invitation';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, phone } = await request.json();
        if (!email || !phone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const currentUser = await User.findById(session.user.id);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (currentUser.role !== 'owner' || !currentUser.household) {
            return NextResponse.json({ error: "Only household owners can invite members" }, { status: 403 });
        }

        const household = await Household.findById(currentUser.household);
        if (!household) {
            return NextResponse.json({ error: "Household not found" }, { status: 404 });
        }

        const invitedUser = await User.findOne({
            $or: [{ email }, { phone }]
        });
        if (!invitedUser) {
            return NextResponse.json({ error: "Invited user not found" }, { status: 404 });
        }

        if (invitedUser.household) {
            return NextResponse.json({ error: "User is already part of a household" }, { status: 400 });
        }

        const code = crypto.randomBytes(6).toString('hex');
        
        const invitation = await Invitation.create({
            code, 
            household: household._id,
            invitedUser: invitedUser._id,
            invitedBy: currentUser._id,
            status: 'pending',
        });

        return NextResponse.json({
            message: "Invitation sent successfully",
            invite: {
                code: invitation.code,
                household: invitation.household,
                invitedUser: invitation.invitedUser,
                invitedBy: invitation.invitedBy,
                status: invitation.status,
                createdAt: invitation.createdAt,
                updatedAt: invitation.updatedAt,
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Error sending invitation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
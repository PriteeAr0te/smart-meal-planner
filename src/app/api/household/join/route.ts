import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Household from "@/models/Household";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code } = await request.json();
        if (!code) {
            return NextResponse.json({ error: 'Missing invitation code' }, { status: 400 });
        }

        await connectToDatabase();

        const currentUser = await User.findById(session.user.id);
        if(!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const invitation = await Invitation.findOne({code, invitedUser: currentUser._id, status: 'pending'});
        if(!invitation) {
            return NextResponse.json({ error: 'Invalid or expired invitation code' }, { status: 400 });
        }

        if(invitation.invitedUser.toString() !== currentUser._id.toString()) {
            return NextResponse.json({error: 'This invitation is not for you'}, {status: 403});
        }

        const household = await Household.findById(invitation.household);
        if(!household) {
            return NextResponse.json({ error: 'Household not found' }, { status: 404 });
        }
        household.members.push(currentUser._id);
        await household.save();

        invitation.status = 'accepted';
        await invitation.save();

        return NextResponse.json({
            message: 'Successfully joined the household',
            household: {
                id: household._id,
                name: household.name,
                members: household.members,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error joining household:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
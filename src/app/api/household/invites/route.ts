import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Household from "@/models/Household";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase();

        const currentUser = await User.findById(session.user.id);
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 })
        }

        if (!currentUser.household) {
            return NextResponse.json({ error: 'User is not a part of any household' }, { status: 400 });
        }

        if (currentUser.role !== 'owner') {
            return NextResponse.json({ error: 'You are not authorized to see the invites' }, { status: 400 });
        }

        const household = await Household.findById(currentUser.household);
        if (!household) {
            return NextResponse.json(
                { error: 'Household not found' },
                { status: 404 }
            )
        }

        const invitations = await Invitation.find({ household: household._id })
            .populate("invitedUser", "name email phone")
            .populate("invitedBy", "name")
            .sort({ createdAt: -1 });

        if (!invitations || invitations.length === 0) {
            return NextResponse.json(
                { error: 'No invitations found' },
                { status: 404 }
            )
        }

        const formattedValues = invitations.map((invite) => ({
            id: invite._id,
            code: invite.code,
            status: invite.status,
            invitedUser: invite.invitedUser ?
                {
                    id: invite.invitedUser._id,
                    name: invite.invitedUser.name,
                    email: invite.invitedUser.email,
                    phone: invite.invitedUser.phone,
                } : null,
            invitedBy: invite.invitedBy ?
                {
                    id: invite.invitedBy._id,
                    name: invite.invitedBy.name,
                } : null,
            household: invite.household,
            createdAt: invite.createdAt,
            updatedAt: invite.updatedAt,
        }))

        return NextResponse.json({ invitations: formattedValues }, { status: 200 })
    } catch (error) {
        console.log("error in fetching invitations", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
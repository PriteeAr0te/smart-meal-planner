import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
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
            return NextResponse.json({ error: 'You are not authorized to see the invites' });
        }

        const invitations = await Invitation.find({ household: currentUser.household })
            .populate("invitedUser", "name email phone")
            .populate("invitedBy", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            invitations: invitations.map((invite) => ({
                id: invite._id,
                code: invite.code,
                invitedBy: invite.invitedBy,
                household: invite.household,
                invitedUser: invite.invitedUser,
            })
            )
        })
    } catch (error) {
        console.log("error in fetching invitations", error);
        return NextResponse.json({
            error: "Internal server error",
            status: 500
        })
    }
}
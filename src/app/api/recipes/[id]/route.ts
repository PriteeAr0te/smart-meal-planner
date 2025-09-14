import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Recipe from "@/models/Recipe";
import { Schema } from "mongoose";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type PopulatedUser = {
    _id: Schema.Types.ObjectId;
    name: string;
    profileImg?: string;
    phone: string;
    email: string;
};

type PopulatedHousehold = {
    _id: Schema.Types.ObjectId;
    name: string;
    owner: Schema.Types.ObjectId;
    members: Schema.Types.ObjectId[];
};

export async function GET(request: NextRequest, { params }: { params: { id?: string } }) {
    try {
        await connectToDatabase();

        const id = params?.id;
        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "Missing recipe id or slug" }, { status: 400 });
        }

        const isObjectId = Types.ObjectId.isValid(id);

        let query;
        if (isObjectId) {
            query = Recipe.findById(id);
        } else {
            query = Recipe.findOne({ slug: id });
        }

        query = query
            .populate("createdBy", "name profileImg phone email _id")
            .populate("household", "name owner, members, _id ");

        const recipe = await query.exec();
        if (!recipe) {
            return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
        }

        if (recipe.isPublic && recipe.status === 'published') {
            return NextResponse.json({ data: recipe }, { status: 200 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required to view this file" }, { status: 401 });
        }

        const userId = session.user.id;

        const createdById = (recipe.createdBy && (recipe.createdBy as PopulatedUser)._id)
            ? String((recipe.createdBy as PopulatedUser)._id)
            : String((recipe.createdBy || ""));

        const household = recipe.household as PopulatedHousehold | Schema.Types.ObjectId | undefined;
        let isHouseholdOwnerOrMember = false;
        if (household && typeof household === 'object' && 'owner' in household) {
            const ownerId = household.owner ? String(household.owner) : null;
            const members: string[] = Array.isArray(household.members)
                ? household.members.map((member: Schema.Types.ObjectId) => String(member))
                : [];

            if (ownerId === String(userId) || members.includes(String(userId))) {
                isHouseholdOwnerOrMember = true;
            }
        }

        const isAuthor = createdById === String(userId);

        if (recipe.status !== 'published') {
            if (!(isAuthor || isHouseholdOwnerOrMember)) {
                return NextResponse.json({ error: `Forbidden: You don't have access to this page` }, { status: 403 });
            } else {
                if(!recipe.isPublic && !(isAuthor || isHouseholdOwnerOrMember)) {
                    return NextResponse.json({error: "Forbidden: This recipe is private to this household"}, {status: 403})
                }
            }
        }

        return NextResponse.json({data: recipe}, {status: 200});

    } catch (error) {
        console.error("Error fetching recipe:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
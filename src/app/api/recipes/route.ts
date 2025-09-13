import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRecipeSchema, getRecipesQuerySchema } from "@/lib/validations/recipe";
import Recipe from "@/models/Recipe";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface RecipeFilter {
    $text?: { $search: string };
    $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
        'ingredients.name'?: { $regex: string; $options: string };
    }>;
    household?: string;
    isPublic?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parsed = createRecipeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const data = parsed.data;
        if (!data.isPublic && !data.household) {
            return NextResponse.json({ error: 'Recipe must be public or have a household' }, { status: 400 });
        }

        const newRecipe = await Recipe.create({
            ...data,
            createdBy: session.user.id,
            household: data.household,
        });

        return NextResponse.json({ recipe: newRecipe }, { status: 201 });

    } catch (error) {
        console.log("error in creating recipe", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);

        const query = Object.fromEntries(searchParams.entries());

        const parsed = getRecipesQuerySchema.safeParse(query);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const { q, householdId, isPublic, limit, page } = parsed.data;
        const filter: RecipeFilter = {};

        if (q) {
            filter.$text = { $search: q };
        }

        if (householdId) {
            filter.household = householdId;
        }

        if (isPublic) {
            filter.isPublic = isPublic === 'true';
        }

        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 20;

        const recipes = await Recipe.find(filter)
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const total = await Recipe.countDocuments(filter);

        return NextResponse.json({
            data: recipes,
            pagination: {
                total,
                page: pageNum,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });

    } catch (error) {
        console.log("Error in fetching recipes", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
import { Schema, models, model, Types } from "mongoose";

export interface IIngredients {
    name: string;
    quantity: number;
    unit: string;
    note?: string;
    isOptional?: boolean;
    alternatives?: string[]
}

export interface ISteps {
    order: number;
    text: string;
    mediaUrls?: string[];
    timerSec?: number;
}

export interface INutrition {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

export interface IRecipe {
    title: string;
    description: string;
    cuisine: string;
    tags?: string[];
    dietTags?: "vegetarian" | "vegan" | "keto" | "paleo" | "balanced" | "none"[];
    allergens?: string[];
    ingredients: IIngredients[];
    steps: ISteps[];
    servings: number;
    prepTime: number;
    cookTime: number;
    nutrition: INutrition;
    coverImage: string;
    images?: string[];
    videoUrl?: string;
    createdBy: Schema.Types.ObjectId;
    household: Schema.Types.ObjectId;
    source?: 'user' | 'ai' | 'curated';
    isPublic: boolean;
    status: 'draft' | 'published' | 'archived';
    verified: boolean;
    favoritesCount?: number;
    ratingAverage?: number;
    ratingCount?: number;
    slug: string;
}

const IngredientSchema = new Schema<IIngredients>({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    quantity: {
        type: Number,
        min: 0,
    },
    unit: {
        type: String,
        trim: true,
    },
    note: {
        type: String,
        trim: true,
    },
    isOptional: {
        type: Boolean,
        default: false,
    },
    alternatives: [{
        type: String,
        trim: true,
    }],
}, { _id: false });

const StepSchema = new Schema<ISteps>({
    order: {
        type: Number,
        required: true,
        min: 1,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    mediaUrls: [{
        type: String,
        trim: true,
    }],
    timerSec: {
        type: Number,
        min: 0,
    },
}, { _id: false });

const NutritionSchema = new Schema<INutrition>({
    calories: {
        type: Number,
        min: 0,
    },
    protein: {
        type: Number,
        min: 0,
    },
    carbs: {
        type: Number,
        min: 0,
    },
    fats: {
        type: Number,
        min: 0,
    },
}, { _id: false })

const RecipeSchema = new Schema<IRecipe>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 120,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 2000,
    },
    cuisine: {
        type: String,
        trim: true,
    },
    tags: [{
        type: String,
        trim: true,
        index: true,
    }],
    dietTags: [{
        type: String,
        enum: ["vegetarian", "vegan", "keto", "paleo", "balanced", "none"],
        default: 'none'
    }],
    allergens: [{
        type: String,
        trim: true,
    }],
    ingredients: {
        type: [IngredientSchema],
        validate: [
            (arr: unknown[]) => Array.isArray(arr) && arr.length > 0,
            "At least one ingredient is required.",
        ],
    },
    steps: {
        type: [StepSchema],
        validate: [
            (arr: ISteps[]) =>
                Array.isArray(arr) && arr.length > 0 &&
                arr.every((s, i, a) =>
                    (i === 0 ? s.order === 1 : s.order === a[i - 1].order + 1)),
            "Steps must start at 1 and be sequential (1,2,3, ...).",
        ],
    },
    servings: {
        type: Number,
        min: 1,
        default: 2
    },
    prepTime: {
        type: Number,
        min: 0,
        default: 0,
    },
    cookTime: {
        type: Number,
        min: 0,
        default: 0,
    },
    nutrition: NutritionSchema,
    coverImage: {
        type: String,
        trim: true,
    },
    images: [{
        type: String,
        trim: true,
    }],
    videoUrl: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    household: {
        type: Schema.Types.ObjectId,
        ref: 'Household',
    },
    source: {
        type: String,
        enum: ["user", "ai", "curated"],
        default: 'ai',
        index: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published',
        index: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    favoritesCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    ratingAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    ratingCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        index: true,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

RecipeSchema.virtual("totalTime").get(function () {
    return (this.prepTime || 0) + (this.cookTime || 0);
});

const Recipe = models.Recipe || model('Recipe', RecipeSchema);
export default Recipe;
export type RecipeId = Types.ObjectId;
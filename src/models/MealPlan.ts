import { model, models, Schema } from "mongoose";

export interface IMealEntry {
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    recipe: Schema.Types.ObjectId;
    note?: string;
}

export interface IMealDay {
    date: Date;
    meal: IMealEntry[];
}

export interface IMealPlan {
    name: string;
    description?: string;
    household: Schema.Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
    days: IMealDay[];
    status: "draft" | "published" | "archived";
    isPublic: boolean;
}

const MealEntrySchema = new Schema<IMealEntry>({
    mealType: {
        type: String,
        enum: ["breakfast", "lunch", "dinner", "snack"],
        required: true,
    },
    recipe: {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
        required: true,
    },
    note: {
        type: String,
        trim: true,
    },
}, { _id: false });

const MealDaySchema = new Schema<IMealDay>({
    date: {
        type: Date,
        required: true,
    },
    meal: {
        type: [MealEntrySchema],
        validate: [(arr: IMealEntry[]) => arr.length > 0, "At least one meal required"],
    },
}, { _id: false });

const MealPlanSchema = new Schema<IMealPlan>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500,
    },
    household: {
        type: Schema.Types.ObjectId,
        ref: "Household",
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    days: {
        type: [MealDaySchema],
        validate: [(arr: IMealDay[]) => arr.length > 0, "At least one day required"],
    },
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft",
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const MealPlan = models.MealPlan || model('MealPlan', MealPlanSchema);
export default MealPlan;
export type MealPlanId = Schema.Types.ObjectId;
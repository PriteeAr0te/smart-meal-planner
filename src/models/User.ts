import { model, models, Schema } from "mongoose";
import { string } from "zod";

const UserSchema = new Schema({
    name: {
        type: string,
        required: true,
    },
    email: {
        type: string,
        required: true,
        unique: true,
    },
    password: {
        type: string,
        // required: true,
    },
    profileImg: {
        type: string,
    },
    role: {
        type: string,
        enum: ["owner", "member", "admin"],
        default: "member",
    },
    status: {
        type: string,
        enum: ["active", "inactive", "banned"],
        default: "active",
    },
    household: {
        type: Schema.Types.ObjectId,
        ref: "Household"
    },
    preferences: {
        dietType: {
            type: string,
            enum: ["vegetarian", "vegan", "keto", "paleo", "balanced", "none"],
            default: 'none',
        },
        allergies: [{
            type: string,
        }],
        dislikedIngredients: [{
            type: string,
        }],
    },
    favorites: {
        recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
        mealPlans: [{ type: Schema.Types.ObjectId, ref: "MealPlan" }],
    },
    createdRecipes: [{ type: Schema.Types.ObjectId, ref: "CustomRecipe" }],
},
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
import { model, models, Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        match: /^\+[1-9]\d{1,14}$/,
    },
    password: {
        type: String,
    },
    profileImg: {
        type: String,
    },
    role: {
        type: String,
        enum: ["owner", "member", "admin"],
        default: "member",
    },
    status: {
        type: String,
        enum: ["active", "inactive", "banned"],
        default: "active",
    },
    household: {
        type: Schema.Types.ObjectId,
        ref: "Household"
    },
    preferences: {
        dietType: {
            type: String,
            enum: ["vegetarian", "vegan", "keto", "paleo", "balanced", "none"],
            default: 'none',
        },
        allergies: [{
            type: String,
        }],
        dislikedIngredients: [{
            type: String,
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
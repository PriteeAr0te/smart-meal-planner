import { HydratedDocument, model, models, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    profileImg?: string;
    role: "owner" | "member" | "admin";
    status: "active" | "inactive" | "banned";
    household?: Schema.Types.ObjectId;
    preferences?: {
        dietType: "vegetarian" | "vegan" | "keto" | "paleo" | "balanced" | "none";
        allergies: string[];
        dislikedIngredients: string[];
    };
    favorites?: {
        recipes: Schema.Types.ObjectId[];
        mealPlans: Schema.Types.ObjectId[];
    };
    createdRecipes?: Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser>

const UserSchema = new Schema<IUser>({
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

UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

const User = models.User || model<IUser>("User", UserSchema);
export default User;
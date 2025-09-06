import { Schema, model, models, Types, Document, Model } from "mongoose";

export interface IReview extends Document {
    recipe: Types.ObjectId;
    user: Types.ObjectId;
    household?: Types.ObjectId;

    rating: number;
    comment?: string;

    likes: Types.ObjectId[];
    status: "active" | "hidden" | "flagged";

    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        recipe: {
            type: Schema.Types.ObjectId,
            ref: "Recipe",
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        household: {
            type: Schema.Types.ObjectId,
            ref: "Household",
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxLength: 1000,
        },

        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        status: {
            type: String,
            enum: ["active", "hidden", "flagged"],
            default: "active",
            index: true,
        },
    },
    { timestamps: true }
);

ReviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

ReviewSchema.virtual("likesCount").get(function (this: IReview) {
    return this.likes.length;
});

ReviewSchema.post("save", async function (doc) {
    const Review = this.constructor as Model<IReview>;
    const Recipe = (await import("./Recipe")).default;

    const stats = await Review.aggregate([
        { $match: { recipe: doc.recipe, status: "active" } },
        {
            $group: {
                _id: "$recipe",
                avgRating: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Recipe.findByIdAndUpdate(doc.recipe, {
            ratingAverage: stats[0].avgRating,
            ratingCount: stats[0].count,
        });
    } else {
        await Recipe.findByIdAndUpdate(doc.recipe, {
            ratingAverage: 0,
            ratingCount: 0,
        });
    }
});

const Review = models.Review || model<IReview>("Review", ReviewSchema);
export default Review;

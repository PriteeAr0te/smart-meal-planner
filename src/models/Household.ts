import { model, models, Schema } from "mongoose";

const HouseholdSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
},
    { timestamps: true },
);

const Household = models.Household || model("Household", HouseholdSchema);
export default Household;
import { HydratedDocument, model, models, Schema } from "mongoose";
import crypto from "crypto";

export interface IHousehold {
    name: string;
    owner: Schema.Types.ObjectId;
    members: Schema.Types.ObjectId[];
    status: "active" | "inactive";
    inviteCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type HouseholdDocument = HydratedDocument<IHousehold>;

const HouseholdSchema = new Schema<IHousehold>({
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
    inviteCode: {
        type: String,
        unique: true,
        sparse: true,
        default: () => crypto.randomBytes(4).toString('hex'),
    },
},
    { timestamps: true },
);

const Household = models.Household || model<IHousehold>("Household", HouseholdSchema);
export default Household;
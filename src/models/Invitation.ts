import crypto from 'crypto';
import { model } from 'mongoose';
import { models, Schema } from "mongoose";

export interface IInvitation {
    code: string;
    household: Schema.Types.ObjectId;
    invitedBy: Schema.Types.ObjectId;
    invitedUser?: Schema.Types.ObjectId;
    status: "pending" | "accepted";
    createdAt: Date;
    updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
    code: {
        type: String,
        unique: true,
        required: true,
        default: () => crypto.randomBytes(6).toString('hex'),
    },
    household: {
        type: Schema.Types.ObjectId,
        ref: "Household",
        required: true,
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    invitedUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Invitation = models.Invitation || model<IInvitation>("Invitation", InvitationSchema);
export default Invitation;

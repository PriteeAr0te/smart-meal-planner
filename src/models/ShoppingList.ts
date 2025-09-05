import { model, models, Schema } from "mongoose";

export interface IShoppingItem {
    name: string;
    quantity?: number;
    unit?: string;
    category: string;
    addedBy: Schema.Types.ObjectId;
    purchased: boolean;
    note?: string;
}

export interface IShoppingList {
    household: Schema.Types.ObjectId;
    user?: Schema.Types.ObjectId;
    items: IShoppingItem[];
    status: "active" | "archived";
}

const ShoppingItemSchema = new Schema<IShoppingItem>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        min: 0,
    },
    unit: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: [
            "grocery",
            "vegetables-fruits",
            "dairy-bakery",
            "medical",
            "stationery",
            "personal-care",
            "household-cleaning",
            "electronics",
            "clothes",
            "others"
        ],
        default: 'others',
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    purchased: {
        type: Boolean,
        default: false,
    },
    note: {
        type: String,
        trim: true,
    },
}, { _id: true });

const ShoppingListSchema = new Schema<IShoppingList>({
    household: {
        type: Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    items: {
        type: [ShoppingItemSchema],
        default: [],
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active',
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

ShoppingListSchema.virtual('pendingCount').get(function (this: IShoppingList) {
    return this.items.filter((item: IShoppingItem) => !item.purchased).length
});

const ShoppingList = models.ShoppingList || model<IShoppingList>('ShoppingList', ShoppingListSchema);
export default ShoppingList;
export type ShoppingListId = Schema.Types.ObjectId;
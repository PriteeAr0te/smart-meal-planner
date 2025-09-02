/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGO_URL!;

if (!MONGODB_URL) {
    throw new Error("Please enter a mongodb url.")
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const options = {
            bufferCommands: true,
            maxPoolSize: 5,
        }

        cached.promise = mongoose
            .connect(MONGODB_URL, options)
            .then(() => mongoose.connection);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}
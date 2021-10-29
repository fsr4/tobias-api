import { Types } from "mongoose";

export function parseObjectId(id: string): Types.ObjectId | null {
    try {
        return Types.ObjectId(id);
    } catch (error) {
        return null;
    }
}

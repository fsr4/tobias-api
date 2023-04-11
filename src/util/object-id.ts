import { Types } from "mongoose";

export function parseObjectId(id: string): Types.ObjectId | null {
    try {
        return new Types.ObjectId(id);
    } catch (error) {
        return null;
    }
}

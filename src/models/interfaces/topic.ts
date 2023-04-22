import { Entity } from "../entity";
import { Types } from "mongoose";

export interface ITopic extends Entity {
    name: string;
    parentTopic: Types.ObjectId | ITopic | null;
    previous: Types.ObjectId | ITopic | null;
    next: Types.ObjectId | ITopic | null;
}

export interface ITopicDocumentProps {
    insertAsChildOf(parentTopic: ITopic): void;

    insertAfter(previousTopic: ITopic): void;

    insertBefore(nextTopic: ITopic): void;

    removeFromAgenda(): void;
}

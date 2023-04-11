import { Document, model, SaveOptions, Schema, Types } from "mongoose";
import { Meeting } from "./meeting";
import { Entity } from "./entity";
import { InvalidDatabaseContentError } from "../util/errors/database-errors";

export type TopicDocument = Topic & Document;

export interface Topic extends Entity {
    meeting: Types.ObjectId | Meeting;
    name: string;
    parent: Types.ObjectId | Topic | null;
    previous: Types.ObjectId | Topic | null;
    next: Types.ObjectId | Topic | null;

    insertAsChildOf(parentTopic: TopicDocument, options: SaveOptions): Promise<TopicDocument>;

    insertAfter(previousTopic: TopicDocument, options: SaveOptions): Promise<TopicDocument>;

    insertBefore(nextTopic: TopicDocument, options: SaveOptions): Promise<TopicDocument>;

    removeFromAgenda(options: SaveOptions): Promise<TopicDocument>;
}

const topicSchema = new Schema({
    meeting: {
        ref: "Meeting",
        type: Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    parent: {
        ref: "Topic",
        type: Schema.Types.ObjectId,
        required: false,
        default: null,
    },
    previous: {
        ref: "Topic",
        type: Schema.Types.ObjectId,
        required: false,
        default: null,
    },
    next: {
        ref: "Topic",
        type: Schema.Types.ObjectId,
        required: false,
        default: null,
    },
}, {
    collection: "topics",
    toJSON: {
        virtuals: true,
    },
});

topicSchema.methods.insertAsChildOf = async function (parentTopic: TopicDocument, options: SaveOptions) {
    const topic = this as unknown as TopicDocument;

    const subTopics = await Topics.find({ parent: parentTopic._id });

    if (subTopics.length !== 0) {
        // Append topic to existing list of sub topics
        const lastSubTopic = subTopics.find((topic) => topic.next === null);
        if (!lastSubTopic)
            throw new InvalidDatabaseContentError();
        lastSubTopic.next = topic._id;
        await lastSubTopic.save(options);
        topic.previous = lastSubTopic._id;
    }

    topic.parent = parentTopic._id;
    return await topic.save(options);
};

topicSchema.methods.insertBefore = async function (nextTopic: TopicDocument, options: SaveOptions) {
    const topic = this as unknown as TopicDocument;

    if (nextTopic.previous !== null) {
        // If inserted between two topics, update prev and next references accordingly
        topic.previous = nextTopic.previous;

        const previousTopic = await Topics.findById(nextTopic.previous);
        if (previousTopic === null)
            throw new InvalidDatabaseContentError();

        previousTopic.next = topic._id;
        await previousTopic.save(options);
    }

    if (nextTopic.parent !== null)
        topic.parent = nextTopic.parent;

    nextTopic.previous = topic._id;
    await nextTopic.save(options);

    topic.next = nextTopic._id;
    return await topic.save(options);
};

topicSchema.methods.insertAfter = async function (previousTopic: TopicDocument, options: SaveOptions) {
    const topic = this as unknown as TopicDocument;

    if (previousTopic.next !== null) {
        // If inserted between two topics, update prev and next references accordingly
        topic.next = previousTopic.next;

        const nextTopic = await Topics.findById(previousTopic.next);
        if (nextTopic === null)
            throw new InvalidDatabaseContentError();

        nextTopic.previous = topic._id;
        await nextTopic.save(options);
    }

    if (previousTopic.parent !== null)
        topic.parent = previousTopic.parent;

    previousTopic.next = topic._id;
    await previousTopic.save(options);

    topic.previous = previousTopic._id;
    return await topic.save(options);
};

topicSchema.methods.removeFromAgenda = async function (options: SaveOptions) {
    const topic = this as unknown as TopicDocument;

    topic.parent = null;

    if (topic.previous !== null && topic.next !== null) {
        // Topic is between two other topics
        const previousTopic = await Topics.findById(topic.previous);
        const nextTopic = await Topics.findById(topic.next);
        if (!previousTopic || !nextTopic)
            throw new InvalidDatabaseContentError();
        // Connect previous topic and next topic directly
        previousTopic.next = nextTopic._id;
        nextTopic.previous = previousTopic._id;
        await previousTopic.save(options);
        await nextTopic.save(options);
    } else if (topic.previous !== null) {
        // Topic is last in list, remove "next" reference from previous topic
        const previousTopic = await Topics.findById(topic.previous);
        if (!previousTopic)
            throw new InvalidDatabaseContentError();
        previousTopic.next = null;
        await previousTopic.save(options);
    } else if (topic.next !== null) {
        // Topic is first in list, remove "previous" reference from next topic
        const nextTopic = await Topics.findById(topic.next);
        if (!nextTopic)
            throw new InvalidDatabaseContentError();
        nextTopic.previous = null;
        const updated = await nextTopic.save(options);
        console.log(updated);
    }

    topic.previous = null;
    topic.next = null;
    return await topic.save(options);
};

const Topics = model<Topic>("Topic", topicSchema);

export default Topics;

import { Schema, Types } from "mongoose";
import { InvalidDatabaseContentError, InvalidOperationError } from "../util/errors/errors";
import { ITopic, ITopicDocumentProps } from "./interfaces/topic";
import { MeetingDocument } from "./meeting";

export type TopicDocument = ITopic & Types.Subdocument;

// eslint-disable-next-line @typescript-eslint/ban-types
export const TopicSchema = new Schema<ITopic, {}, ITopicDocumentProps>({
    name: {
        type: String,
        required: true,
    },
    parentTopic: {
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

export function createTopic(topic: OptionalExceptFor<ITopic, "name">): ITopic {
    return {
        _id: topic._id ?? new Types.ObjectId(),
        name: topic.name,
        __v: topic.__v ?? 0,
        parentTopic: topic.parentTopic ?? null,
        previous: topic.previous ?? null,
        next: topic.next ?? null,
    };
}

export function insertTopicAsChild(meeting: MeetingDocument, topic: TopicDocument | ITopic, parentTopic: TopicDocument) {
    if ("parent" in topic && !topic.parent().equals(meeting) || !parentTopic.parent().equals(meeting))
        throw new InvalidOperationError(
            `Topics ${topic._id} and ${parentTopic._id} need to be children of meeting ${meeting._id}`
        );

    const subTopics = meeting.topics.filter(t => t.parentTopic?._id.equals(parentTopic._id));

    if (subTopics.length !== 0) {
        // Append topic to existing list of sub topics
        const lastSubTopic = subTopics.find((topic) => topic.next === null);
        if (!lastSubTopic)
            throw new InvalidDatabaseContentError();
        lastSubTopic.next = topic._id;
        topic.previous = lastSubTopic._id;
    }

    topic.parentTopic = parentTopic._id;
}

export function insertTopicBefore(meeting: MeetingDocument, topic: TopicDocument | ITopic, nextTopic: TopicDocument) {
    if ("parent" in topic && !topic.parent().equals(meeting) || !nextTopic.parent().equals(meeting))
        throw new InvalidOperationError(
            `Topics ${topic._id} and ${nextTopic._id} need to be children of meeting ${meeting._id}`
        );

    if (nextTopic.previous !== null) {
        // If inserted between two topics, update prev and next references accordingly
        topic.previous = nextTopic.previous;

        const previousTopic = meeting.topics.id(nextTopic.previous);
        if (previousTopic === null)
            throw new InvalidDatabaseContentError();

        previousTopic.next = topic._id;
    }

    if (nextTopic.parentTopic !== null)
        topic.parentTopic = nextTopic.parentTopic;

    nextTopic.previous = topic._id;

    topic.next = nextTopic._id;
}

export function insertTopicAfter(meeting: MeetingDocument, topic: TopicDocument | ITopic, previousTopic: TopicDocument) {
    if ("parent" in topic && !topic.parent().equals(meeting) || !previousTopic.parent().equals(meeting))
        throw new InvalidOperationError(
            `Topics ${topic._id} and ${previousTopic._id} need to be children of meeting ${meeting._id}`
        );

    if (previousTopic.next !== null) {
        // If inserted between two topics, update prev and next references accordingly
        topic.next = previousTopic.next;

        const nextTopic = meeting.topics.id(previousTopic.next);
        if (nextTopic === null)
            throw new InvalidDatabaseContentError();

        nextTopic.previous = topic._id;
    }

    if (previousTopic.parentTopic !== null)
        topic.parentTopic = previousTopic.parentTopic;

    previousTopic.next = topic._id;

    topic.previous = previousTopic._id;
}

export function removeTopicFromAgenda(meeting: MeetingDocument, topic: TopicDocument | ITopic) {
    if ("parent" in topic && !topic.parent().equals(meeting))
        throw new InvalidOperationError(`Topic ${topic._id} needs to be a child of meeting ${meeting._id}`);

    topic.parentTopic = null;

    if (topic.previous !== null && topic.next !== null) {
        // Topic is between two other topics
        const previousTopic = meeting.topics.id(topic.previous);
        const nextTopic = meeting.topics.id(topic.next);
        if (!previousTopic || !nextTopic)
            throw new InvalidDatabaseContentError();
        // Connect previous topic and next topic directly
        previousTopic.next = nextTopic._id;
        nextTopic.previous = previousTopic._id;
    } else if (topic.previous !== null) {
        // Topic is last in list, remove "next" reference from previous topic
        const previousTopic = meeting.topics.id(topic.previous);
        if (!previousTopic)
            throw new InvalidDatabaseContentError();
        previousTopic.next = null;
    } else if (topic.next !== null) {
        // Topic is first in list, remove "previous" reference from next topic
        const nextTopic = meeting.topics.id(topic.next);
        if (!nextTopic)
            throw new InvalidDatabaseContentError();
        nextTopic.previous = null;
    }

    topic.previous = null;
    topic.next = null;

    return topic;
}

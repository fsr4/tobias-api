import { BadRequest, NotFound } from "../util/errors/http-errors";
import Meetings, { findMeetingWithTopic, MeetingDocument } from "../models/meeting";
import defaultTopics from "../util/default-topics";
import { Types } from "mongoose";
import { ITopic } from "../models/interfaces/topic";
import {
    createTopic,
    insertTopicAfter,
    insertTopicAsChild,
    insertTopicBefore,
    removeTopicFromAgenda,
    TopicDocument,
} from "../models/topic";
import { InvalidApplicationStateError } from "../util/errors/errors";

export class TopicController {
    async list(meetingId: Types.ObjectId): Promise<ITopic[]> {
        const meeting = await Meetings.findById(meetingId);
        if (!meeting) throw new NotFound(`Meeting with id ${meetingId} not found`);
        return meeting.topics;
    }

    async get(id: Types.ObjectId): Promise<ITopic> {
        const { topic } = await findMeetingWithTopic(id);
        return topic;
    }

    async create(
        meetingId: Types.ObjectId,
        name: string,
        parentTopicId?: Types.ObjectId,
        previousTopicId?: Types.ObjectId,
        nextTopicId?: Types.ObjectId,
    ): Promise<ITopic> {
        const meeting = await Meetings.findById(meetingId);
        if (!meeting) throw new BadRequest(`Meeting with id ${meetingId} not found`);

        const topicIndex = meeting.topics.push(createTopic({ name }));
        // Fetch topic from meeting to enable proper change tracking
        const topic = meeting.topics[topicIndex - 1];

        if (parentTopicId !== undefined) {
            const parentTopic = meeting.topics.id(parentTopicId);
            if (parentTopic === null) throw new BadRequest(`Parent topic with id ${parentTopicId} not found`);
            insertTopicAsChild(meeting, topic, parentTopic);
        } else if (previousTopicId !== undefined) {
            const previousTopic = meeting.topics.id(previousTopicId);
            if (previousTopic === null) throw new BadRequest(`Previous topic with id ${parentTopicId} not found`);
            insertTopicAfter(meeting, topic, previousTopic);
        } else if (nextTopicId !== undefined) {
            const nextTopic = meeting.topics.id(nextTopicId);
            if (nextTopic === null) throw new BadRequest(`Next topic with id ${parentTopicId} not found`);
            insertTopicBefore(meeting, topic, nextTopic);
        }

        const updatedMeeting = await meeting.save();
        const updatedTopic = updatedMeeting.topics.id(topic._id);

        // If updated topic doesn't exist, although it was just inserted, then something went wrong
        if (updatedTopic === null)
            throw new InvalidApplicationStateError();

        return updatedTopic;
    }

    async edit(
        id: Types.ObjectId,
        name?: string,
        parentTopicId?: Types.ObjectId | null,
        previousTopicId?: Types.ObjectId | null,
        nextTopicId?: Types.ObjectId | null,
    ): Promise<ITopic> {
        const { meeting, topic } = await findMeetingWithTopic(id);

        if (name !== undefined)
            topic.name = name;

        this.editTopicOrder(meeting, topic, parentTopicId, previousTopicId, nextTopicId);

        const updatedMeeting = await meeting.save();
        const updatedTopic = updatedMeeting.topics.id(id);
        if (updatedTopic === null)
            throw new InvalidApplicationStateError();
        return updatedTopic;
    }

    private editTopicOrder(
        meeting: MeetingDocument,
        topic: TopicDocument,
        parentTopicId?: Types.ObjectId | null,
        previousTopicId?: Types.ObjectId | null,
        nextTopicId?: Types.ObjectId | null,
    ) {
        if (parentTopicId === undefined && previousTopicId === undefined && nextTopicId === undefined)
            return topic;

        // Topic order changed, remove topic from agenda before re-inserting it if necessary
        removeTopicFromAgenda(meeting, topic);

        if (parentTopicId === null && previousTopicId === null && nextTopicId === null)
            // Do not re-insert the topic
            return;

        if (parentTopicId !== undefined)
            return this.insertTopic(meeting, topic, "parent", parentTopicId);

        if (previousTopicId !== undefined)
            return this.insertTopic(meeting, topic, "previous", previousTopicId);

        if (nextTopicId !== undefined)
            return this.insertTopic(meeting, topic, "next", nextTopicId);

        throw new InvalidApplicationStateError(
            "This should never happen, but the linter won't allow me to specify this case correctly"
        );
    }

    private insertTopic(
        meeting: MeetingDocument,
        topic: TopicDocument,
        insertType: "parent" | "previous" | "next",
        relatedTopicId: Types.ObjectId | null,
    ) {
        if (relatedTopicId === null)
            throw new BadRequest(`The ${insertType} topic has to be a valid object id of another topic. ` +
                "To remove a topic from the list all three id fields (parent, previous, next) have to be null.");
        if (topic._id.equals(relatedTopicId))
            throw new BadRequest(`A topic may not use its own id as ${insertType} reference`);
        const relatedTopic = meeting.topics.id(relatedTopicId);
        if (!relatedTopic)
            throw new BadRequest(`${insertType} topic with id ${relatedTopicId} not found`);
        switch (insertType) {
            case "parent":
                return insertTopicAsChild(meeting, topic, relatedTopic);
            case "previous":
                return insertTopicAfter(meeting, topic, relatedTopic);
            case "next":
                return insertTopicBefore(meeting, topic, relatedTopic);
        }
    }

    async remove(id: Types.ObjectId): Promise<void> {
        const { meeting, topic } = await findMeetingWithTopic(id);
        removeTopicFromAgenda(meeting, topic);
        await topic.remove();
        await meeting.save();
    }

    async createDefaultTopics(meetingId: Types.ObjectId): Promise<ITopic[]> {
        let previousTopicId = undefined;
        for (const t of defaultTopics) {
            const topic: ITopic = await this.create(meetingId, t.name, undefined, previousTopicId);
            previousTopicId = topic._id;
            if (t.subs) {
                let previousSubTopicId = undefined;
                for (const sub of t.subs) {
                    const subTopic: ITopic = await this.create(meetingId, sub.name, topic._id, previousSubTopicId);
                    previousSubTopicId = subTopic._id;
                }
            }
        }

        return this.list(meetingId);
    }
}

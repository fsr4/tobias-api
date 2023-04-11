import { BadRequest, NotFound } from "../util/errors/http-errors";
import Topics, { Topic, TopicDocument } from "../models/topic";
import Meetings from "../models/meeting";
import defaultTopics from "../util/default-topics";
import { ClientSession, Types } from "mongoose";

export class TopicController {
    async list(meetingId: Types.ObjectId): Promise<Topic[]> {
        const meeting = await Meetings.findById(meetingId);
        if (!meeting) throw new NotFound(`Meeting with id ${meetingId} not found`);
        return Topics.find({ meeting: meetingId }).lean();
    }

    async get(id: Types.ObjectId): Promise<Topic> {
        const topic = await Topics.findById(id).lean();
        if (!topic) throw new NotFound(`Topic with id ${id} not found`);
        return topic;
    }

    async create(
        meetingId: Types.ObjectId,
        name: string,
        parentTopicId?: Types.ObjectId,
        previousTopicId?: Types.ObjectId,
        nextTopicId?: Types.ObjectId,
    ): Promise<Topic> {
        const session = await Topics.startSession();
        await session.startTransaction();

        const meeting = await Meetings.findById(meetingId).lean();
        if (!meeting) throw new BadRequest(`Meeting with id ${meetingId} not found`);

        let topic: TopicDocument = (await Topics.create([{
            meeting: meeting._id,
            name: name,
        }], { session }))[0];

        if (parentTopicId !== undefined) {
            const parentTopic = await Topics.findById(parentTopicId);
            if (!parentTopic) throw new BadRequest(`Parent topic with id ${parentTopicId} not found`);
            topic = await topic.insertAsChildOf(parentTopic, { session });
        } else if (previousTopicId !== undefined) {
            const previousTopic = await Topics.findById(previousTopicId);
            if (!previousTopic) throw new BadRequest(`Previous topic with id ${parentTopicId} not found`);
            topic = await topic.insertAfter(previousTopic, { session });
        } else if (nextTopicId !== undefined) {
            const nextTopic = await Topics.findById(nextTopicId);
            if (!nextTopic) throw new BadRequest(`Next topic with id ${parentTopicId} not found`);
            topic = await topic.insertBefore(nextTopic, { session });
        }

        await session.commitTransaction();
        return topic;
    }

    async edit(
        id: Types.ObjectId,
        name?: string,
        parentTopicId?: Types.ObjectId | null,
        previousTopicId?: Types.ObjectId | null,
        nextTopicId?: Types.ObjectId | null,
    ): Promise<Topic> {
        const session = await Topics.startSession();
        await session.startTransaction();

        const topic = await Topics.findById(id).session(session);
        if (!topic) throw new NotFound(`Topic with id ${id} not found`);

        if (name !== undefined)
            topic.name = name;

        const updatedTopic = await this.editTopicOrder(topic, session, parentTopicId, previousTopicId, nextTopicId);

        const savedTopic = await updatedTopic.save();
        await session.commitTransaction();
        return savedTopic;
    }

    private async editTopicOrder(
        topic: TopicDocument,
        session: ClientSession,
        parentTopicId?: Types.ObjectId | null,
        previousTopicId?: Types.ObjectId | null,
        nextTopicId?: Types.ObjectId | null,
    ): Promise<TopicDocument> {
        if (parentTopicId === undefined && previousTopicId === undefined && nextTopicId === undefined)
            return topic;

        // Topic order changed, remove topic from agenda before re-inserting it if necessary
        const unscheduledTopic = await topic.removeFromAgenda({ session });

        if (parentTopicId === null && previousTopicId === null && nextTopicId === null)
            // Do not re-insert the topic
            return unscheduledTopic;

        if (parentTopicId !== undefined)
            return await this.insertTopic(unscheduledTopic, session, "parent", parentTopicId);

        if (previousTopicId !== undefined)
            return await this.insertTopic(unscheduledTopic, session, "previous", previousTopicId);

        if (nextTopicId !== undefined)
            return await this.insertTopic(unscheduledTopic, session, "next", nextTopicId);

        throw new BadRequest("This should never happen, but the linter won't allow me to specify this case correctly");
    }

    private async insertTopic(
        topic: TopicDocument,
        session: ClientSession,
        insertType: "parent" | "previous" | "next",
        relatedTopicId: Types.ObjectId | null,
    ): Promise<TopicDocument> {
        if (relatedTopicId === null)
            throw new BadRequest(`The ${insertType} topic has to be a valid object id of another topic. ` +
                "To remove a topic from the list all three id fields (parent, previous, next) have to be null.");
        const relatedTopic = await Topics.findById(relatedTopicId);
        if (!relatedTopic)
            throw new BadRequest(`${insertType} topic with id ${relatedTopicId} not found`);
        switch (insertType) {
            case "parent":
                return await topic.insertAsChildOf(relatedTopic, { session });
            case "previous":
                return await topic.insertAfter(relatedTopic, { session });
            case "next":
                return await topic.insertBefore(relatedTopic, { session });
        }
    }

    async remove(id: Types.ObjectId): Promise<void> {
        const session = await Topics.startSession();
        await session.startTransaction();

        const topic = await Topics.findById(id);
        if (!topic) throw new NotFound(`Topic with id ${id} not found`);

        const removedTopic = await topic.removeFromAgenda({ session });
        await removedTopic.remove({ session });
        await session.commitTransaction();
    }

    async createDefaultTopics(meetingId: Types.ObjectId): Promise<Topic[]> {
        let previousTopicId = undefined;
        for (const t of defaultTopics) {
            const topic: Topic = await this.create(meetingId, t.name, undefined, previousTopicId);
            previousTopicId = topic._id;
            if (t.subs) {
                let previousSubTopicId = undefined;
                for (const sub of t.subs) {
                    const subTopic: Topic = await this.create(meetingId, sub.name, topic._id, previousSubTopicId);
                    previousSubTopicId = subTopic._id;
                }
            }
        }

        return this.list(meetingId);
    }
}

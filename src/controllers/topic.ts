import { BadRequest, NotFound } from "../util/errors";
import Topics, { Topic, TopicResponse } from "../models/topic";
import Meetings from "../models/meeting";
import { LooseObject } from "../util/loose-object";
import { defaultSubTopics, defaultTopics } from "../util/default-topics";
import { Types } from "mongoose";

export class TopicController {
    async list(meetingId: string): Promise<TopicResponse[]> {
        const topics = await Topics.find({ meeting: meetingId }).populate("parent");
        const responses = [];
        for (const topic of topics)
            responses.push(await topic.toResponseObject());
        return responses.sort((a, b) => a.fullPosition.localeCompare(b.fullPosition));
    }

    async get(id: string): Promise<Topic> {
        const topic = await Topics.findById(id).populate("parent");
        if (!topic)
            throw new NotFound(`Topic with id ${id} not found`);
        return topic;
    }

    async create(meetingId: string, name: string, position?: number, parentTopicId?: string | Types.ObjectId): Promise<Topic> {
        const meeting = await Meetings.findById(meetingId).lean();
        if (!meeting)
            throw new BadRequest(`Meeting with id ${meetingId} not found`);

        const topic: LooseObject = {
            meeting: meeting._id,
            name: name
        };

        if (parentTopicId !== undefined) {
            const parentTopic = await Topics.findById(parentTopicId).lean();
            if (!parentTopic)
                throw new BadRequest(`Parent topic with id ${parentTopicId} not found`);

            topic.parent = parentTopic._id;
        }

        if (position !== undefined)
            topic.position = position;

        const newTopic = await Topics.create(topic);
        return await newTopic.populate("parent").execPopulate();
    }

    async edit(id: string, name?: string, position?: number | null, parentTopicId?: string | null): Promise<Topic> {
        const topic = await Topics.findById(id).populate("parent");
        if (!topic)
            throw new NotFound(`Topic with id ${id} not found`);

        // Update name if it is set
        if (name !== undefined)
            topic.name = name;

        // Check if parent changed
        if (parentTopicId === null && topic.parent === null)
            parentTopicId = undefined;
        if (parentTopicId !== undefined && topic.parent && (topic.parent as Topic)._id.equals(parentTopicId as string))
            parentTopicId = undefined;

        // Update position (and parent) if position is set
        if (position !== undefined)
            await topic.updatePosition(position, parentTopicId);

        return topic.save();
    }

    async remove(id: string): Promise<void> {
        const topic = await Topics.findById(id);
        if (!topic)
            throw new NotFound(`Topic with id ${id} not found`);
        // Update position of other topics in the list, if necessary; then delete topic
        await topic.updatePosition(null);
        await Topics.findByIdAndRemove(id);
    }

    async createDefaultTopics(meetingId: string): Promise<Topic[]> {
        const topicPromises = [];
        for (const topic of defaultTopics)
            topicPromises.push(this.create(meetingId, topic.name, topic.position));
        await Promise.all(topicPromises);

        const subTopicPromises = [];
        for (const topic of defaultSubTopics) {
            const parentTopic = await Topics.findOne({ position: topic.parent }).lean();
            if (!parentTopic)
                throw new BadRequest("Invalid default topic setup");
            subTopicPromises.push(this.create(meetingId, topic.name, topic.position, parentTopic._id));
        }
        await Promise.all(subTopicPromises);

        return this.list(meetingId);
    }
}

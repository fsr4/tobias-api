import { Document, model, Schema, Types } from "mongoose";
import { Meeting } from "./meeting";
import { Entity } from "./entity";
import { LooseObject } from "../util/loose-object";
import { BadRequest } from "../util/errors";

export interface Topic extends Entity {
    meeting: Types.ObjectId | Meeting;
    name: string;
    position: number | null;
    parent: Types.ObjectId | Topic | null;

    updatePosition(position: number | null, parentTopicId?: string | null): Promise<void>;
    getFullPosition(): Promise<string>;
    toResponseObject(): Promise<TopicResponse>;
}

export interface TopicResponse extends Topic {
    fullPosition: string;
}

const topicSchema = new Schema({
    meeting: {
        ref: "Meeting",
        type: Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: false
    },
    parent: {
        ref: "Topic",
        type: Schema.Types.ObjectId,
        required: false,
        default: null
    }
}, {
    collection: "topics",
    toJSON: {
        virtuals: true
    }
});

topicSchema.methods.updatePosition = async function (position: number | null, parentTopicId?: string | null) {
    const topic = this as unknown as Topic;

    // If position is set to null (topic removed from list), set parent also to null
    if (position === null)
        parentTopicId = null;

    let parentTopic;
    if (parentTopicId === undefined) {
        // parent did not change
        parentTopic = { _id: undefined };
    } else if (parentTopicId === null) {
        // parent removed
        parentTopic = { _id: null };
    } else {
        // parent added
        parentTopic = await Topics.findById(parentTopicId).lean();
        if (!parentTopic)
            throw new BadRequest(`Parent topic with id ${parentTopicId} not found`);

        /*const children = await Topics.find({ parent: topic });

        if (parentTopic.parent || children.length > 0)
            throw new BadRequest("Max nesting level reached");*/
    }

    const updateQuery: LooseObject = { meeting: topic.meeting };
    let moveStep = 0;

    if (topic.parent && !parentTopic._id)
        updateQuery.parent = topic.parent;
    else if (parentTopic._id)
        updateQuery.parent = parentTopic._id;

    const parentChanged = parentTopic._id !== undefined;//topic.parent === null && parentTopic._id || topic.parent !== null && parentTopic._id === null || parentTopic._id && !(topic.parent as Topic)._id.equals(parentTopic._id);

    console.debug("Parent: " + (parentChanged ? (topic.parent ? (topic.parent as Topic)._id : "null") + " -> " + parentTopic._id : "not changed"));
    console.debug("Position: " + topic.position + " -> " + position);

    if (!topic.position) {
        console.debug("Added");
        // Topic added to list
        updateQuery.position = { $gte: position };
        moveStep = 1;
    } else if (position === null) {
        console.debug("Removed");
        // Topic removed from list
        updateQuery.position = { $gte: topic.position };
        moveStep = -1;
    } else if (!parentChanged && position > topic.position) {
        console.debug("Moved down");
        // Topic moved down the list, move up entries in between
        // find and update all topics between old and new position
        position--;
        updateQuery.position = { $gt: topic.position, $lte: position };
        moveStep = -1;
    } else if (!parentChanged && position < topic.position) {
        console.debug("Moved up");
        // Topic moved up the list, move down entries in between
        // find and update all topics between old and new position
        updateQuery.position = { $gte: position, $lt: topic.position };
        moveStep = 1;
    } else if (parentTopic._id === null) {
        console.debug("Moved out");
        // Topic moved out of sublist
        // Move all topics behind new position down by one
        const outerUpdateQuery = { meeting: topic.meeting, parent: parentTopic._id, position: { $gte: position } };
        console.debug("Moving topics >= " + position + " down");
        await moveTopics(outerUpdateQuery, 1);
        // Move all topics behind old position up by one
        updateQuery.position = { $gt: topic.position };
        updateQuery.parent = topic.parent;
        moveStep = -1;
    } else if (parentTopic._id && !topic.parent) {
        console.debug("Moved in");
        // Topic moved into sublist
        // Move all topics behind old position up by one
        const outerUpdateQuery = { meeting: topic.meeting, parent: topic.parent, position: { $gt: topic.position } };
        await moveTopics(outerUpdateQuery, -1);
        // Move all topics behind new position down by one
        updateQuery.position = { $gte: position };
        updateQuery.parent = parentTopic._id;
        moveStep = 1;
    } else {
        throw new Error("Unhandled case D:");
    }

    await moveTopics(updateQuery, moveStep);
    topic.position = position;
    if (parentTopic._id !== undefined)
        topic.parent = parentTopic._id;
};

/**
 * Moves the topics returned by the query by the specified step size
 * @param query The query for finding topics
 * @param stepSize The number of steps to move the topics
 */
async function moveTopics(query: LooseObject, stepSize: number): Promise<void> {
    const topics = await Topics.find(query);
    const updates = [];
    for (const t of topics) {
        t.position = (t.position as number) + stepSize;
        updates.push(t.save());
    }
    await Promise.all(updates);
}

topicSchema.methods.getFullPosition = async function () {
    const topic = this as unknown as Topic;
    let fullPosition = "" + topic.position;
    let parent = topic.parent;

    while (parent) {
        if (!(parent as Topic).position)
            parent = await Topics.findOne(parent as Types.ObjectId);
        fullPosition = (parent as Topic).position + "." + fullPosition;
        parent = (parent as Topic).parent;
    }

    return fullPosition;
};

topicSchema.methods.toResponseObject = async function () {
    const topic = this as unknown as Topic & Document<unknown, unknown, Topic>;
    const response: TopicResponse = {
        ...topic.toObject({ depopulate: true, virtuals: true }),
        fullPosition: await topic.getFullPosition()
    };
    return response;
};

const Topics = model<Topic>("Topic", topicSchema);

export default Topics;

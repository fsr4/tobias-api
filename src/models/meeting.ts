import { Document, Model, model, Schema, Types } from "mongoose";
import { TopicDocument, TopicSchema } from "./topic";
import { IMeeting } from "./interfaces/meeting";
import { ITopic } from "./interfaces/topic";
import { NotFound } from "../util/errors/http-errors";
import { InvalidApplicationStateError } from "../util/errors/errors";

export type MeetingDocument = IMeeting & Document;

interface IMeetingVirtuals {
    firstTopic: ITopic;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type MeetingModel = Model<IMeeting, {}, {}, IMeetingVirtuals>;

const meetingSchema = new Schema<IMeeting, MeetingModel>({
    dateTime: {
        type: Date,
        required: true,
    },
    topics: [{
        type: TopicSchema,
        default: [],
    }],
}, {
    collection: "meetings",
});

meetingSchema.virtual("firstTopic").get(function (this: IMeeting): ITopic | undefined {
    return this.topics.filter(t => t.parent === null && t.previous == null)[0];
});

const Meetings = model<IMeeting, MeetingModel>("Meeting", meetingSchema);

export async function findMeetingByTopicId(topicId: Types.ObjectId): Promise<MeetingDocument | null> {
    return Meetings.findOne({ topics: { $elemMatch: { _id: topicId } } });
}

export async function findMeetingWithTopic(topicId: Types.ObjectId): Promise<{
    meeting: MeetingDocument,
    topic: TopicDocument
}> {
    const meeting = await findMeetingByTopicId(topicId);
    if (!meeting) throw new NotFound(`Topic with id ${topicId} not found`);

    const topic = meeting.topics.id(topicId);
    // We found this meeting using the given topic id, so it should always contain the topic with the given id
    if (topic === null)
        throw new InvalidApplicationStateError();

    return { meeting, topic };
}

export default Meetings;

import { model, Schema } from "mongoose";
import { Entity } from "./entity";
import Topics, { Topic } from "./topic";

export interface Meeting extends Entity {
    dateTime: Date;
    firstTopic: Promise<Topic>;
}

const meetingSchema = new Schema({
    dateTime: {
        type: Date,
        required: true,
    },
}, {
    collection: "meetings",
});

meetingSchema.virtual("firstTopic").get(async function (this: Meeting): Promise<Topic | undefined> {
    const topics = await Topics.find({ meeting: this._id });
    return topics.filter(t => t.parent === null && t.previous == null)[0];
});

const Meetings = model<Meeting>("Meeting", meetingSchema);

export default Meetings;

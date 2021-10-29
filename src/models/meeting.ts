import { model, Schema } from "mongoose";
import { Entity } from "./entity";

export interface Meeting extends Entity {
    dateTime: Date;
}

const meetingSchema = new Schema({
    dateTime: {
        type: Date,
        required: true
    }
}, {
    collection: "meetings"
});

const Meetings = model<Meeting>("Meeting", meetingSchema);

export default Meetings;

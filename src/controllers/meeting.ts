import Meetings from "../models/meeting";
import { NotFound } from "../util/errors/http-errors";
import { Invitation } from "../mail/invitation";
import { IMeeting } from "../models/interfaces/meeting";

export class MeetingController {
    async list(): Promise<IMeeting[]> {
        return Meetings.find().lean();
    }

    async get(id: string): Promise<IMeeting> {
        const meeting = await Meetings.findById(id);
        if (!meeting)
            throw new NotFound(`Meeting with id ${id} not found`);
        return meeting;
    }

    async create(dateTime: string): Promise<IMeeting> {
        return Meetings.create({
            dateTime: new Date(dateTime),
        });
    }

    async edit(id: string, dateTime?: string): Promise<IMeeting> {
        const meeting = await Meetings.findById(id);
        if (!meeting)
            throw new NotFound(`Meeting with id ${id} not found`);

        // Update dateTime if it is set
        if (dateTime !== undefined) {
            meeting.dateTime = new Date(dateTime);
        }

        return meeting.save();
    }

    async remove(id: string): Promise<void> {
        await Meetings.findByIdAndRemove(id);
    }

    async sendInvitation(id: string): Promise<void> {
        const meeting = await Meetings.findById(id).lean();
        if (!meeting)
            throw new NotFound(`Meeting with id ${id} not found`);
        const topics = meeting.topics;
        const mail = new Invitation(meeting.dateTime, topics);
        await mail.send();
    }
}

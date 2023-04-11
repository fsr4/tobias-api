import Meetings, { Meeting } from "../models/meeting";
import { NotFound } from "../util/errors/http-errors";
import Topics from "../models/topic";
import { Invitation } from "../mail/invitation";

export class MeetingController {
    async list(): Promise<Meeting[]> {
        return Meetings.find().lean();
    }

    async get(id: string): Promise<Meeting> {
        const meeting = await Meetings.findById(id).lean();
        if (!meeting)
            throw new NotFound(`Meeting with id ${id} not found`);
        return meeting;
    }

    async create(dateTime: string): Promise<Meeting> {
        return Meetings.create({
            dateTime: new Date(dateTime),
        });
    }

    async edit(id: string, dateTime?: string): Promise<Meeting> {
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
        const topics = await Topics.find({ meeting: meeting._id }).lean();
        const mail = new Invitation(meeting.dateTime, topics);
        // TODO: Make receiver a parameter
        await mail.send("test@kaes3kuch3n.de");
    }
}

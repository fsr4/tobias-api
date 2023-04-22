import { ITopic } from "../models/interfaces/topic";
import { formatDate, generateTopicList } from "./formatters";
import { sendMail } from "./index";
import Settings from "../models/settings";

export class Invitation {
    private readonly dateTime: Date;
    private readonly topics: ITopic[];

    constructor(dateTime: Date, topics: ITopic[]) {
        this.dateTime = dateTime;
        this.topics = topics;
    }

    async send(): Promise<void> {
        const settings = await Settings.findOne();
        if (!settings) throw new Error("Error while loading settings from database");
        const subject = settings.mailSubjectTemplate
            .replace(/{{dateTime}}/, formatDate(this.dateTime, true));
        const message = settings.mailBodyTemplate
            .replace(/{{subject}}/, subject)
            .replace(/{{dateTime}}/, formatDate(this.dateTime))
            .replace(/{{to}}/, generateTopicList(this.topics));

        await sendMail(
            settings.receiverAddresses,
            subject,
            message
        );
    }
}

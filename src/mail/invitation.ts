import { Topic } from "../models/topic";
import { readFile } from "fs/promises";
import { formatDate, generateTopicList } from "./formatters";
import { sendMail } from "./index";

export class Invitation {
    private readonly dateTime: Date;
    private readonly topics: Topic[];

    constructor(dateTime: Date, topics: Topic[]) {
        this.dateTime = dateTime;
        this.topics = topics;
    }

    async send(receiverAddress: string): Promise<void> {
        const template = await readFile(`${process.cwd()}/templates/invitation.html`);
        const subject = `Einladung zur FSR4-Sitzung am ${formatDate(this.dateTime, true)}`;
        const message = template.toString()
            .replace(/{{subject}}/, subject)
            .replace(/{{dateTime}}/, formatDate(this.dateTime))
            .replace(/{{to}}/, generateTopicList(this.topics));

        await sendMail(
            receiverAddress,
            subject,
            message
        );
    }
}

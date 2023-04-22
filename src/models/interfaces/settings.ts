import { Entity } from "../entity";

export interface ISettings extends Entity {
    receiverAddresses: string[];
    mailSubjectTemplate: string;
    mailBodyTemplate: string;
    autoSendMails: boolean;
    autoSendDeadlineDays: number;
}

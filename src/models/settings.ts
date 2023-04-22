import { ISettings } from "./interfaces/settings";
import { Document, model, Schema } from "mongoose";

export type SettingsDocument = ISettings & Document;

const settingsSchema = new Schema<ISettings>({
    receiverAddresses: [{
        type: String,
        required: true,
    }],
    mailSubjectTemplate: {
        type: String,
        required: true,
    },
    mailBodyTemplate: {
        type: String,
        required: true,
    },
    autoSendMails: {
        type: Boolean,
        required: true,
        default: false,
    },
    autoSendDeadlineDays: {
        type: Number,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        required: () => this.autoSendMails,
        default: 3,
    },
}, {
    collection: "settings",
});

const Settings = model<ISettings>("Settings", settingsSchema);

export default Settings;

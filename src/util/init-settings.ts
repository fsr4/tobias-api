import Settings from "../models/settings";
import { readFile } from "fs/promises";

export default function initSettings() {
    (async () => {
        const settings = await Settings.findOne();
        if (settings) return;

        // Settings do not exist, create default settings
        const mailTemplate = await readFile(`${process.cwd()}/templates/invitation.html`);
        const newSettings = new Settings({
            receiverAddresses: ["test@kaes3kuch3n.de"],
            mailSubjectTemplate: "Einladung zur FSR4-Sitzung am {{dateTime}}",
            mailBodyTemplate: mailTemplate.toString(),
            autoSendMails: false,
        });
        await newSettings.save();
    })();
}

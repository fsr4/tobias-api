import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { htmlToText } from "nodemailer-html-to-text";
import { mail } from "../config";

export async function sendMail(to: string, subject: string, message: string): Promise<SMTPTransport.SentMessageInfo> {
    const transporter = createTransport({
        host: mail.host,
        port: mail.port,
        secure: true,
        auth: {
            user: mail.user,
            pass: mail.password
        }
    });

    transporter.use("compile", htmlToText());

    return transporter.sendMail({
        from: {
            name: "Fachschaftsrat 4",
            address: "<fsr4@students-htw.de>"
        },
        to: to,
        subject: subject,
        html: message
    });
}

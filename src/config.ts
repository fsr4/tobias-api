export const port = Number.parseInt(process.env.PORT ?? "") || 3000;

export const db = {
    host: process.env.DB_HOST ?? "localhost",
    port: Number.parseInt(process.env.DB_PORT ?? "") || 27017,
    database: "top-tool"
};

export const mail = {
    host: process.env.MAIL_HOST || "",
    port: Number.parseInt(process.env.MAIL_PORT ?? "") || 465,
    user: process.env.MAIL_USER || "",
    password: process.env.MAIL_PASSWORD || ""
};

import { Topic } from "../models/topic";

export function generateTopicList(topics: Topic[]): string {
    const mainTopics = topics.filter(t => !t.parent && t.position);
    const nonMainTopics = topics.filter(t => t.parent && t.position);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const sortedTopics = mainTopics.sort((a, b) => (a.position > b.position) ? 1 : -1);
    let message = "<ol>";
    for (const topic of sortedTopics) {
        message += `<li>${topic.name}`;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const subTopics = nonMainTopics.filter(t => t.parent.id === topic.id );
        if (subTopics.length > 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const sortedSubTopics = subTopics.sort((a, b) => (a.position > b.position) ? 1 : -1);
            message += "<ol>";
            for (const subTopic of sortedSubTopics) {
                message += `<li>${subTopic.name}</li>`;
            }
            message += "</ol></li>";
        } else message += "</li>";
    }
    message += "</ol>";
    console.log(message);
    return message;
}

const longDateTimeFormat = new Intl.DateTimeFormat("de-de", {
    dateStyle: "full",
    timeStyle: "short"
});

const shortDateTimeFormat = new Intl.DateTimeFormat("de-de", {
    dateStyle: "short",
    timeStyle: "short"
});

export function formatDate(dateTime: Date, short?: boolean): string {
    if (short === true)
        return shortDateTimeFormat.format(dateTime);
    return longDateTimeFormat.format(dateTime);
}

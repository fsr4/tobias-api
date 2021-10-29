import { Topic } from "../models/topic";

export function generateTopicList(topics: Topic[]): string {
    /*const mainTopics = topics.filter(t => !t.parent);
    const subTopics = topics.filter(t => t.parent);
    const sortedTopics = [];
    for (const topic of mainTopics) {
        sortedTopics.push(topic);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const subTopic of subTopics.filter(t => topic._id.equals(t.parent?._id)))
            sortedTopics.push(subTopic);
    }

    let message = "<ol><li>";
    let isIndented = false;
    for (const topic of sortedTopics) {
        if (topic.parent) {
            if (!isIndented) {
                message += "<ol><li>";
                isIndented = true;
            } else message += "</li><li>";
            message += `${topic.fullPosition} ${topic.name}`;
        } else {
            if (isIndented) {
                message += "</li></ol><li>";
                isIndented = false;
            } else message += "</li><li>";
            message += `${topic.fullPosition} ${topic.name}`;
        }
    }
    message += "</li></ol>";
    return message;*/
    // TODO: Fix this
    return "to be fixed";
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

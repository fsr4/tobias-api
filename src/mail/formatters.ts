import { Topic } from "../models/topic";
import { InvalidDatabaseContentError } from "../util/errors/database-errors";
import sortTopics from "../util/sort-topics";
import { Types } from "mongoose";

export function generateTopicList(topics: Topic[]): string {
    const mainTopics = getOrderedMainTopics(topics);
    const topicList = mainTopics.reduce((list, topic) =>
        list + generateSubTopicList(topics, topic), "<ol>");
    return topicList + "</ol>";
}

function generateSubTopicList(topics: Topic[], parentTopic: Topic): string {
    const subTopics = getOrderedSubTopics(topics, parentTopic);
    if (subTopics.length === 0)
        return `<li>${parentTopic.name}</li>`;

    const subTopicList = subTopics.reduce((list, topic) =>
        list + generateSubTopicList(topics, topic), `<li>${parentTopic.name}<ol>`);
    return subTopicList + "</ol></li>";
}

function getOrderedMainTopics(topics: Topic[]): Topic[] {
    const mainTopics = topics.filter(t => t.parent === null && (t.next || t.previous));
    if (mainTopics.length === 0) return [];
    const firstTopic = mainTopics.find(t => t.previous === null);
    if (!firstTopic) throw new InvalidDatabaseContentError();
    return sortTopics(firstTopic, mainTopics);
}

function getOrderedSubTopics(topics: Topic[], parent: Topic): Topic[] {
    const subTopics = topics.filter(t => t.parent && (t.parent as Types.ObjectId).equals(parent._id));
    if (subTopics.length === 0) return [];
    const firstTopic = subTopics.find(t => t.previous === null);
    if (!firstTopic) throw new InvalidDatabaseContentError();
    return sortTopics(firstTopic, subTopics);
}

const longDateTimeFormat = new Intl.DateTimeFormat("de-de", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
});

const shortDateTimeFormat = new Intl.DateTimeFormat("de-de", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
});

export function formatDate(dateTime: Date, short?: boolean): string {
    const format = short === true ? shortDateTimeFormat : longDateTimeFormat;
    return format.format(dateTime) + " Uhr";
}

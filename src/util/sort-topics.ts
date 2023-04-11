import { Topic } from "../models/topic";

function sort(sorted: Topic[], remaining: Topic[]): Topic[] {
    const nextTopicId = sorted[sorted.length - 1].next;
    if (!nextTopicId) return sorted;
    const nextIndex = remaining.findIndex(topic => topic._id.equals(nextTopicId._id));
    if (nextIndex === -1) return sorted;
    const next = remaining.splice(nextIndex, 1)[0];
    sorted.push(next);
    return sort(sorted, remaining);
}

export default function sortTopics(head: Topic, topics: Topic[]): Topic[] {
    return sort([head], topics);
}

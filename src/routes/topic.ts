import { TopicEndpoints } from "../endpoints/topic";
import { TopicController } from "../controllers/topic";

const endpoints = new TopicEndpoints(new TopicController());
const topicRouter = endpoints.createDefaultRouter();

topicRouter.post("/default", endpoints.createDefaultTopics());

export default topicRouter;

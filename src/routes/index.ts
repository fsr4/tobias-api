import * as Router from "koa-router";
import meetingRouter from "./meeting";
import topicRouter from "./topic";

const router = new Router();

router.use("/meetings", meetingRouter.routes(), meetingRouter.allowedMethods());

router.use("/topics", topicRouter.routes(), topicRouter.allowedMethods());

export default router;

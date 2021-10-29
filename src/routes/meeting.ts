import { MeetingEndpoints } from "../endpoints/meeting";
import { MeetingController } from "../controllers/meeting";

const endpoints = new MeetingEndpoints(new MeetingController());
const meetingRouter = endpoints.createDefaultRouter();

meetingRouter.post("/:id/send-invitation", endpoints.sendInvitation());

export default meetingRouter;

import { body, param, validate } from "../validation";
import { Middleware } from "koa";
import * as compose from "koa-compose";
import { DefaultEndpointSet } from "./endpoint-set";
import { MeetingController } from "../controllers/meeting";

export class MeetingEndpoints extends DefaultEndpointSet<MeetingController> {
    list(): Middleware {
        return () => this.controller.list();
    }

    create(): Middleware {
        return compose([
            validate(
                body("dateTime").isISO8601()
            ),
            ctx => {
                const dateTime = ctx.request.body.dateTime;
                return this.controller.create(dateTime);
            }
        ]);
    }

    get(): Middleware {
        return compose([
            validate(
                param("id").isMongoId()
            ),
            ctx => this.controller.get(ctx.request.params.id)
        ]);
    }

    edit(): Middleware {
        return compose([
            validate(
                param("id").isMongoId(),
                body("dateTime").optional().isISO8601()
            ),
            ctx => {
                const id = ctx.request.params.id;
                const dateTime = ctx.request.body.dateTime;
                return this.controller.edit(id, dateTime);
            }
        ]);
    }

    remove(): Middleware {
        return compose([
            validate(
                param("id").isMongoId()
            ),
            ctx => this.controller.remove(ctx.request.params.id)
        ]);
    }

    sendInvitation(): Middleware {
        return compose([
            validate(
                param("id").isMongoId()
            ),
            ctx => this.controller.sendInvitation(ctx.request.params.id)
        ]);
    }
}

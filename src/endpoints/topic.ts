import { Middleware } from "koa";
import * as compose from "koa-compose";
import { body, param, query, validate } from "../validation";
import { DefaultEndpointSet } from "./endpoint-set";
import { TopicController } from "../controllers/topic";
import validator from "validator";

export class TopicEndpoints extends DefaultEndpointSet<TopicController> {
    list(): Middleware {
        return compose([
            validate(
                query("meeting").isMongoId()
            ),
            ctx => this.controller.list(ctx.request.query.meeting as string)
        ]);
    }

    create(): Middleware {
        return compose([
            validate(
                body("meeting").isMongoId(),
                body("name").isString(),
                body("position").optional().isInt(),
                body("parentTopic").optional().isMongoId()
            ),
            ctx => {
                const meetingId = ctx.request.body.meeting;
                const name = ctx.request.body.name;
                const position = ctx.request.body.position;
                const parentTopicId = ctx.request.body.parentTopic;
                return this.controller.create(meetingId, name, position, parentTopicId);
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
                body("name").optional().isString(),
                body("position").optional().custom((pos) =>
                    validator.isInt(pos) || pos === "null"
                ),
                body("parent").optional().custom((id) =>
                    validator.isMongoId(id) || id === "null"
                )
            ),
            ctx => {
                const id = ctx.request.params.id;
                const name = ctx.request.body.name;
                const position = ctx.request.body.position === "null" ? null : ctx.request.body.position;
                const parentTopicId = ctx.request.body.parent === "null" ? null : ctx.request.body.parent;
                return this.controller.edit(id, name, position, parentTopicId);
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

    createDefaultTopics(): Middleware {
        return compose([
            validate(
                query("meeting").isMongoId()
            ),
            ctx => this.controller.createDefaultTopics(ctx.request.query.meeting as string)
        ]);
    }
}

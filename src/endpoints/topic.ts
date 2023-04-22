import { Middleware } from "koa";
import * as compose from "koa-compose";
import { body, param, query, validate } from "../validation";
import { DefaultEndpointSet } from "./endpoint-set";
import { TopicController } from "../controllers/topic";
import validator from "validator";
import { Types } from "mongoose";

export class TopicEndpoints extends DefaultEndpointSet<TopicController> {
    list(): Middleware {
        return compose([
            validate(
                query("meeting").isMongoId()
            ),
            ctx => this.controller.list(new Types.ObjectId(ctx.request.query.meeting as string)),
        ]);
    }

    create(): Middleware {
        return compose([
            validate(
                body("meeting").isMongoId(),
                body("name").isString(),
                body("parent").optional().isMongoId(),
                body("insertAfter").optional().isMongoId(),
                body("insertBefore").optional().isMongoId(),
            ),
            ctx => {
                const meetingId = ctx.request.body.meeting;
                const name = ctx.request.body.name;
                const parentTopicId = ctx.request.body.parent
                    ? new Types.ObjectId(ctx.request.body.parent)
                    : undefined;
                const previousTopicId = ctx.request.body.insertAfter
                    ? new Types.ObjectId(ctx.request.body.insertAfter)
                    : undefined;
                const nextTopicId = ctx.request.body.insertBefore
                    ? new Types.ObjectId(ctx.request.body.insertBefore)
                    : undefined;
                return this.controller.create(meetingId, name, parentTopicId, previousTopicId, nextTopicId);
            },
        ]);
    }

    get(): Middleware {
        return compose([
            validate(
                param("id").isMongoId()
            ),
            ctx => this.controller.get(new Types.ObjectId(ctx.request.params.id)),
        ]);
    }

    edit(): Middleware {
        return compose([
            validate(
                param("id").isMongoId(),
                body("name").optional().isString(),
                body("parent").optional().custom((id) =>
                    validator.isMongoId(id) || id === "null"
                ),
                body("insertAfter").optional().custom((id) =>
                    validator.isMongoId(id) || id === "null"
                ),
                body("insertBefore").optional().custom((id) =>
                    validator.isMongoId(id) || id === "null"
                ),
            ),
            ctx => {
                const id = new Types.ObjectId(ctx.request.params.id);
                const name = ctx.request.body.name;
                const parentTopicId = ctx.request.body.parent === "null"
                    ? null
                    : ctx.request.body.parent ? new Types.ObjectId(ctx.request.body.parent) : undefined;
                const previousTopicId = ctx.request.body.insertAfter === "null"
                    ? null
                    : ctx.request.body.insertAfter ? new Types.ObjectId(ctx.request.body.insertAfter) : undefined;
                const nextTopicId = ctx.request.body.insertBefore === "null"
                    ? null
                    : ctx.request.body.insertBefore ? new Types.ObjectId(ctx.request.body.insertBefore) : undefined;
                return this.controller.edit(id, name, parentTopicId, previousTopicId, nextTopicId);
            },
        ]);
    }

    remove(): Middleware {
        return compose([
            validate(
                param("id").isMongoId()
            ),
            ctx => this.controller.remove(new Types.ObjectId(ctx.request.params.id)),
        ]);
    }

    createDefaultTopics(): Middleware {
        return compose([
            validate(
                query("meeting").isMongoId()
            ),
            ctx => this.controller.createDefaultTopics(new Types.ObjectId(ctx.request.query.meeting as string)),
        ]);
    }
}

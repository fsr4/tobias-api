import { Middleware } from "koa";
import * as Router from "koa-router";

export abstract class DefaultEndpointSet<Controller> {
    protected controller: Controller;

    constructor(controller: Controller) {
        this.controller = controller;
    }

    abstract list(): Middleware;

    abstract create(): Middleware;

    abstract get(): Middleware;

    abstract edit(): Middleware;

    abstract remove(): Middleware;

    createDefaultRouter(): Router {
        const router = new Router();
        router.get("/", this.list());
        router.post("/", this.create());
        router.get("/:id", this.get());
        router.patch("/:id", this.edit());
        router.delete("/:id", this.remove());
        return router;
    }
}

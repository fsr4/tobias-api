import * as koa from "koa";

declare module "koa" {
    interface Request {
        params: { [key: string]: string }
    }
}

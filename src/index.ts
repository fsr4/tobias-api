import Koa from "koa";
import * as mongoose from "mongoose";
import * as logger from "koa-logger";
import * as compress from "koa-compress";
import * as koaBody from "koa-body";
import * as koaCors from "koa-cors";
import { ApiError, NotFound } from "./util/errors";
import { db, port } from "./config";
import router from "./routes";

// Setup database connection
mongoose.connect(`mongodb://${db.host}:${db.port}/${db.database}`, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(({ connection: c }) => {
    console.log(`Database connection to mongodb://${c.host}:${c.port}/${c.db.databaseName} established.`);
}).catch(error => {
    console.error("MongoDB connection failed:\n", error);
    process.exit(1);
});

// Setup server
const server = new Koa();

// Setup logging, response compression, body parsing and cors
server.use(logger()).use(compress()).use(koaBody()).use(koaCors({
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
}));

// Setup API response and error handler
server.use(async (ctx, next) => {
    try {
        const response = await next();
        if (!response)
            ctx.status = 204;
        else
            ctx.body = response;
    } catch (error) {
        if (error instanceof ApiError) {
            ctx.status = error.statusCode;
            const response: { [k: string]: unknown } = { error: error.message };
            if (error.details)
                response.details = error.details;
            ctx.body = response;
        } else {
            throw error;
        }
    }
});

// Use routes from router
server.use(router.routes()).use(router.allowedMethods());

// Catch all other routes and return 404
server.use(ctx => {
    throw new NotFound(`${ctx.method} ${ctx.path}: Not found`);
});

// Start server and listen for incoming connections
server.listen(port, () => console.log(`Server listening on port ${port}...`));

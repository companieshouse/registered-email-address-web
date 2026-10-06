// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application } from "express";
import * as config from "./config/index";
import index_router from "./routers/index_router";
import company_router from "./routers/company_router";
import email_router from "./routers/email_router";
import healthcheck from "./routers/healthcheck";
import { authentication_middleware } from "./middleware/authentication_middleware";
import { company_authentication_middleware } from "./middleware/company_authentication_middleware";

const router_dispatch = (app: Application) => {
    app.use(config.COMPANY_BASE_URL, authentication_middleware, company_router);
    app.use(config.EMAIL_BASE_URL, authentication_middleware, company_authentication_middleware, email_router);
    app.use(config.SIGN_OUT_URL, authentication_middleware);
    app.use(config.HEALTHCHECK_URL, healthcheck);
    app.use("/", index_router);
};

export default router_dispatch;

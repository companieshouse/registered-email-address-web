// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application } from "express";
import * as config from "./config/index";
import index_router from "./routers/index_router";
import company_router from "./routers/company_router";
import email_router from "./routers/email_router";

const router_dispatch = (app: Application) => {
  app.use("/", index_router);
  app.use(config.COMPANY_BASE_URL, company_router);
  app.use(config.EMAIL_BASE_URL, email_router);
};

export default router_dispatch;

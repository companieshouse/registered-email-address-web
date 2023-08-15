// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application } from "express";
import * as config from "./config/index";
import indexRouter from "./routers/index.router";
import companyRouter from "./routers/company.router";
import emailRouter from "./routers/email.router";

const routerDispatch = (app: Application) => {
  app.use("/", indexRouter);
  app.use(config.COMPANY_BASE_URL, companyRouter);
  app.use(config.EMAIL_BASE_URL, emailRouter);
};

export default routerDispatch;

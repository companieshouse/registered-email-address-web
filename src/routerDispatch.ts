// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application } from "express";
import * as config from "./config/index";
import indexRouter from "./routers/indexRouter";
import companyRouter from "./routers/companyRouter";
import emailRouter from "./routers/emailRouter";

const routerDispatch = (app: Application) => {
  app.use("/", indexRouter);
  app.use(config.COMPANY_BASE_URL, companyRouter);
  app.use(config.EMAIL_BASE_URL, emailRouter);
};

export default routerDispatch;

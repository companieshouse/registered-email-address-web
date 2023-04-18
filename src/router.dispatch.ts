// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application } from "express";
import indexRouter from "./routers/indexRouter";

const routerDispatch = (app: Application) => {
    app.use("/", indexRouter);

};

export default routerDispatch;

import { Request, Response, Router, NextFunction } from "express";
import * as config from "../config";
import {
    home,
    signIn
} from "./handlers/index";

const router: Router = Router();

router.get(config.LANDING_URL, home.get);
router.post(config.LANDING_URL, home.post);

router.get(config.SIGN_IN_URL, signIn.get);

export default router;

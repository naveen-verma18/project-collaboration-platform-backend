import express from "express";
import { createUserController } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/users", createUserController);

//module.exports = router;
export default router;
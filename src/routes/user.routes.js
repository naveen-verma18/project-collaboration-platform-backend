const express = require("express");
const { createUserController } = require("../controllers/user.controller");

const router = express.Router();

router.post("/users", createUserController);

module.exports = router;

const userService = require("../services/user.service");

async function createUserController(req, res) {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  createUserController,
};
console.log(".............Controller reloaded....................");

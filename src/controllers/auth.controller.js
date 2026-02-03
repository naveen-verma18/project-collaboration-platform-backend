const authService = require("../services/auth.service");

async function loginController(req, res) {
  try {
    const token = await authService.loginUser(req.body);

    res.status(200).json({
      token,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
}

module.exports = {
  loginController,
};

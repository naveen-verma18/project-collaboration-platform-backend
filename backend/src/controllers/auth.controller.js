import { signup, loginUser } from "../services/auth.service.js";

export async function signupController(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await signup({ email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;

    const token = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
}

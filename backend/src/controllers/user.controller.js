import * as userService from "../services/user.service.js";
export async function createUserController(req, res) {
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
export default createUserController
// module.exports = {
//   createUserController,
// };
console.log(".............Controller reloaded....................");

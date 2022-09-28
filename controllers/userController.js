const ApiError = require('../error/ApiError');
const { User } = require('../models/models');

class UserController {
    async getAll(req, res, next) {
        try {
            const users = await User.findAll();

            return res.json(users);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updateRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            await User.update({ role }, { where: { id } });

            return res.json({ message: "user's role changed" });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

}
module.exports = new UserController();

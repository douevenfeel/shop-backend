const bcrypt = require('bcrypt');
const ApiError = require('../error/ApiError');
const { User } = require('../models/models');

class UserController {
    async createAdmin(req, res, next) {
        try {
            const user = await User.findOne({
                where: {
                    email: process.env.ADMIN_EMAIL,
                    firstName: process.env.ADMIN_FIRSTNAME,
                    lastName: process.env.ADMIN_LASTNAME,
                    role: 'ADMIN',
                },
            });
            if (user) {
                return res.json('admin already created');
            }
            await User.create({
                email: process.env.ADMIN_EMAIL,
                password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 5),
                firstName: process.env.ADMIN_FIRSTNAME,
                lastName: process.env.ADMIN_LASTNAME,
                role: 'ADMIN',
            });
            return res.json('admin created');
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAll(req, res, next) {
        try {
            const users = await User.findAll();
            users.map((user) => delete user.dataValues.password);

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

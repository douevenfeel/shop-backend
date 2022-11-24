const bcrypt = require('bcrypt');
const ApiError = require('../error/ApiError');
const { User } = require('../models/models');

class UserController {
    async createManager(req, res, next) {
        try {
            const user = await User.findOne({
                where: {
                    email: process.env.MANAGER_EMAIL,
                    firstName: process.env.MANAGER_FIRSTNAME,
                    lastName: process.env.MANAGER_LASTNAME,
                    role: 'MANAGER',
                },
            });
            if (user) {
                return res.json('hello world');
            }
            await User.create({
                email: process.env.MANAGER_EMAIL,
                password: await bcrypt.hash(process.env.MANAGER_PASSWORD, 5),
                firstName: process.env.MANAGER_FIRSTNAME,
                lastName: process.env.MANAGER_LASTNAME,
                role: 'MANAGER',
            });

            return res.json('manager created');
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
            const { id, role } = req.body;
            await User.update({ role }, { where: { id } });

            return res.json({ message: "user's role changed" });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}
module.exports = new UserController();

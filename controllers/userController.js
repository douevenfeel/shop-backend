const bcrypt = require('bcrypt');
const ApiError = require('../error/ApiError');
const { User } = require('../models/models');
const { Op } = require('sequelize');

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
            let { page, searchValue, searchBy } = req.query;
            const limit = 36;
            page = page || 1;
            let offset = page * limit - limit;
            let users;
            if (searchValue === '') {
                users = await User.findAndCountAll({
                    page,
                    limit,
                    offset,
                });
            } else {
                if (searchBy === 'email') {
                    users = await User.findAndCountAll({
                        where: { email: { [Op.iLike]: `%${searchValue}%` } },
                        page,
                        limit,
                        offset,
                    });
                } else if (searchBy === 'firstName') {
                    users = await User.findAndCountAll({
                        where: { firstName: { [Op.iLike]: `%${searchValue}%` } },
                        page,
                        limit,
                        offset,
                    });
                } else if (searchBy === 'lastName') {
                    users = await User.findAndCountAll({
                        where: { lastName: { [Op.iLike]: `%${searchValue}%` } },
                        page,
                        limit,
                        offset,
                    });
                } else {
                    users = await User.findAndCountAll({
                        where: { role: { [Op.iLike]: `%${searchValue}%` } },
                        page,
                        limit,
                        offset,
                    });
                }
            }
            users.rows.map((user) => delete user.dataValues.password);

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

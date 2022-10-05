const ApiError = require('../error/ApiError');
const { User } = require('../models/models');
const bcrypt = require('bcrypt');
const tokenService = require('../services/tokenService');
const { validationResult } = require('express-validator');

class AuthController {
    async signup(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.badRequest('validation error', errors.array()));
            }
            const { email, password, firstName, lastName } = req.body;
            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return next(ApiError.badRequest('user already exists'));
            }
            const hashPassword = await bcrypt.hash(password, 5);
            const user = await User.create({ email, password: hashPassword, firstName, lastName });
            const tokens = tokenService.generateTokens({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            await tokenService.saveToken(user.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 1000 * 60 * 60, httpOnly: true });
            delete user.dataValues.password;

            return res.json({
                ...tokens,
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async signin(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return next(ApiError.badRequest('wrong email or password'));
            }
            const isPassEquals = await bcrypt.compare(password, user.password);
            if (!isPassEquals) {
                return next(ApiError.badRequest('wrong email or password'));
            }
            const tokens = tokenService.generateTokens({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            await tokenService.saveToken(user.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 1000 * 60 * 60, httpOnly: true });
            delete user.dataValues.password;

            return res.json({
                ...tokens,
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = tokenService.removeToken(refreshToken);
            res.clearCookie('refreshToken');

            return res.json(token);
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return next(ApiError.unauthorizedError());
            }
            console.log(true, refreshToken);
            const validToken = tokenService.validateRefreshToken(refreshToken);
            const findedToken = await tokenService.findToken(refreshToken);
            if (!validToken || !findedToken) {
                return next(ApiError.unauthorizedError());
            }
            const user = await User.findOne({ where: { id: validToken.id } });
            const tokens = tokenService.generateTokens({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            await tokenService.saveToken(user.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 1000 * 60 * 60, httpOnly: true });
            delete user.dataValues.password;

            return res.json({
                ...tokens,
                user,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();

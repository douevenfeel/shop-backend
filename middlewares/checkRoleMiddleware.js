const ApiError = require('../error/ApiError');
const { User } = require('../models/models');
const tokenService = require('../services/tokenService');

module.exports = function (role) {
    return async function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next();
        }
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return next(ApiError.unauthorizedError());
            }
            const validToken = tokenService.validateRefreshToken(refreshToken);
            const findedToken = await tokenService.findToken(refreshToken);
            const user = await User.findOne({ where: { id: findedToken.dataValues.userId } });
            if (!user) {
                return next(ApiError.internal('error'));
            }
            if (!validToken || !findedToken) {
                return next(ApiError.unauthorizedError());
            }
            if (user.dataValues.role !== role) {
                return next(ApiError.forbidden());
            }
            next();
        } catch (e) {
            return next(ApiError.unauthorizedError());
        }
    };
};

const ApiError = require('../error/ApiError');
const tokenService = require('../services/tokenService');

module.exports = async function (req, res, next) {
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
        if (!validToken || !findedToken) {
            return next(ApiError.unauthorizedError());
        }
        req.userId = findedToken.dataValues.userId;
        next();
    } catch (e) {
        return next(ApiError.unauthorizedError());
    }
};

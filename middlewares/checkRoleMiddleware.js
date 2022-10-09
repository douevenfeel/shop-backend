const ApiError = require('../error/ApiError');
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
            if (!validToken || !findedToken) {
                return next(ApiError.unauthorizedError());
            }
            if (findedToken.role !== role) {
                return next(ApiError.forbidden('forbidden'));
            }
            req.token = findedToken;
            next();
        } catch (e) {
            return next(ApiError.unauthorizedError());
        }
    };
};

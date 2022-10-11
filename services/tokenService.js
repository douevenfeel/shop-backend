const jwt = require('jsonwebtoken');
const { Token } = require('../models/models');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken,
        };
    }

    validateAccessToken(token) {
        try {
            const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            return user;
        } catch (error) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const user = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

            return user;
        } catch (error) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const findedToken = await Token.findOne({ where: { userId } });
        if (findedToken) {
            findedToken.refreshToken = refreshToken;
            return findedToken.save();
        }
        const token = await Token.create({ userId, refreshToken });

        return token;
    }

    async removeToken(refreshToken) {
        const token = await Token.destroy({ where: { refreshToken } });

        return token;
    }

    async findToken(refreshToken) {
        try {
            const token = await Token.findOne({ where: { refreshToken } });

            return token;
        } catch (error) {
            return null;
        }
    }
}

module.exports = new TokenService();

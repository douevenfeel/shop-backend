const { Basket } = require('../models/models');
const ApiError = require('../error/ApiError');

class BasketController {
    async getBasket(req, res, next) {
        try {
            const { userId } = req.params;
            const basket = await Basket.findAll({ where: { userId }, order: [['id', 'ASC']] });

            return res.json(basket);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async addDevice(req, res, next) {
        try {
            const { deviceId, userId } = req.body;
            const basket = await Basket.findOne({ where: { userId, deviceId } });
            if (basket) {
                return res.json({ message: 'device already in the basket' });
            }
            await Basket.create({ userId, deviceId });

            return res.json({ message: 'device added to the basket' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async changeCount(req, res, next) {
        try {
            const { userId } = req.params;
            const { count, deviceId } = req.body;
            if (count === 0) {
                await Basket.destroy({ where: { userId, deviceId } });

                return res.json({ message: 'device deleted from the basket' });
            }
            await Basket.update({ count }, { where: { userId, deviceId } });

            return res.json({ message: "device's count changed" });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async changeSelected(req, res, next) {
        try {
            const { userId } = req.params;
            const { deviceId, selected } = req.body;
            await Basket.update({ selected }, { where: { userId, deviceId } });

            return res.json({ message: 'device deleted from selected' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async remove(req, res, next) {
        try {
            const { userId } = req.params;
            const { deviceId } = req.body;
            await Basket.destroy({ where: { userId, deviceId } });

            return res.json({ message: 'device deleted from the basket' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new BasketController();

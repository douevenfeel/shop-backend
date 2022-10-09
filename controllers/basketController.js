const { Basket } = require('../models/models');
const ApiError = require('../error/ApiError');

class BasketController {
    async getBasket(req, res, next) {
        try {
            const userId = req.userId;
            const basket = await Basket.findAll({ where: { userId }, order: [['id', 'ASC']] });

            return res.json(basket);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async addDevice(req, res, next) {
        try {
            const userId = req.userId;
            const { deviceId } = req.body;
            const basket = await Basket.findOne({ where: { userId, deviceId } });
            if (basket) {
                basket.count++;
                basket.save();

                return res.json({ message: "device's count increased" });
            }
            await Basket.create({ userId, deviceId });

            return res.json({ message: 'device added to the basket' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async changeCount(req, res, next) {
        try {
            const userId = req.userId;
            const { count, deviceId } = req.body;
            const basket = await Basket.findOne({ where: { userId, deviceId } });
            if (!basket) {
                return res.json({ message: 'no device in the basket' });
            }
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
            const userId = req.userId;
            const { deviceId, selected } = req.body;
            const basket = await Basket.findOne({ where: { userId, deviceId } });
            if (!basket) {
                return res.json({ message: 'no device in the basket' });
            }
            await Basket.update({ selected }, { where: { userId, deviceId } });

            return res.json({ message: 'device deleted from selected' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async remove(req, res, next) {
        try {
            const userId = req.userId;
            const { deviceId } = req.body;
            const basket = await Basket.findOne({ where: { userId, deviceId } });
            if (!basket) {
                return res.json({ message: 'no device in the basket' });
            }
            await Basket.destroy({ where: { userId, deviceId } });

            return res.json({ message: 'device deleted from the basket' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new BasketController();

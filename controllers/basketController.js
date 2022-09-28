const { BasketDevice } = require('../models/models');
const ApiError = require('../error/ApiError');

class BasketController {
    async getBasket(req, res, next) {
        try {
            const { basketId } = req.params;

            const basket = await BasketDevice.findAll({ where: { basketId }, order: [['id', 'ASC']] });

            return res.json(basket);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async addDevice(req, res, next) {
        try {
            const { basketId, deviceId } = req.body;
            const basketDevice = await BasketDevice.findOne({ where: { basketId, deviceId } });
            if (basketDevice) {
                return res.json({ message: 'device already in the basket' });
            }
            await BasketDevice.create({ basketId, deviceId });
            return res.json({ message: 'device added to the basket' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async changeCount(req, res, next) {
        try {
            const { basketId } = req.params;
            const { count, deviceId } = req.body;
            if (count === 0) {
                await BasketDevice.destroy({ where: { basketId, deviceId } });

                return res.json({ message: 'device deleted from the basket' });
            }
            await BasketDevice.update({ count }, { where: { basketId, deviceId } });

            return res.json({ message: "device's count changed" });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async changeSelected(req, res, next) {
        try {
            const { basketId } = req.params;
            const { deviceId, selected } = req.body;
            await BasketDevice.update({ selected }, { where: { basketId, deviceId } });

            return res.json({ message: 'device deleted from selected' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async remove(req, res, next) {
        try {
            const { basketId } = req.params;
            const { deviceId } = req.body;
            await BasketDevice.destroy({ where: { basketId, deviceId } });

            return res.json({ message: 'device deleted from the basket' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new BasketController();

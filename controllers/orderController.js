const ApiError = require('../error/ApiError');
const { User, Device, Order, OrderDevice, Basket, Brand } = require('../models/models');

class OrderController {
    async create(req, res, next) {
        try {
            const userId = req.userId;
            const user = await User.findOne({ where: { id: userId } });
            const basket = await Basket.findAll({ where: { userId: user.id, selected: true } });
            if (basket.length === 0) {
                return res.json({ message: 'empty basket' });
            }
            const orderDate = new Date();
            let deliveryDate = new Date();
            deliveryDate = deliveryDate.setDate(deliveryDate.getDate() + 2);
            let order = await Order.create({
                userId: user.id,
                orderDate: orderDate,
                deliveryDate,
            });
            basket.forEach(async (device) => {
                const findedDevice = await Device.findOne({ where: { id: device.deviceId } });
                if (findedDevice.dataValues.available) {
                    await OrderDevice.create({
                        orderId: order.id,
                        deviceId: findedDevice.id,
                        count: device.count,
                        price: findedDevice.price,
                    });
                    await Basket.destroy({ where: { userId, deviceId: findedDevice.id } });
                }
            });

            return res.json(order);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAllAdmin(req, res, next) {
        try {
            let { limit, page, canceled, delivered, userId } = req.query;
            page = page || 1;
            limit = limit || 6;
            let offset = page * limit - limit;
            const params = {};
            if (canceled !== undefined) {
                params.canceled = canceled;
            }
            if (delivered !== undefined) {
                params.delivered = delivered;
            }
            if (userId !== undefined) {
                params.userId = userId;
            }
            const orders = await Order.findAndCountAll({
                where: { ...params },
                order: [['orderDate', 'DESC']],
                page,
                limit,
                offset,
            });

            return res.json(orders);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAll(req, res, next) {
        try {
            const userId = req.userId;
            let { limit, page, canceled, delivered } = req.query;
            page = page || 1;
            limit = limit || 8;
            let offset = page * limit - limit;
            const params = { hidden: false, userId };
            if (canceled !== undefined) {
                params.canceled = canceled;
            }
            if (delivered !== undefined) {
                params.delivered = delivered;
            }

            const orders = await Order.findAndCountAll({
                where: { ...params },
                order: [['orderDate', 'DESC']],
                page,
                limit,
                offset,
            });

            return res.json(orders);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getOne(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const order = await Order.findOne({
                where: { id, userId },
                include: { model: OrderDevice, include: { model: Device, include: { model: Brand } } },
            });
            if (!order || order.hidden) {
                return next(ApiError.badRequest("order doesn't exist"));
            }

            return res.json(order);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async cancel(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.body;
            const order = await Order.findOne({ where: { id, userId } });
            if (!order) {
                return next(ApiError.badRequest("order doesn't exist"));
            }
            if (order.delivered) {
                return res.json({ message: 'order already delivered' });
            }
            await Order.update({ canceled: true }, { where: { id } });

            return res.json({ message: 'order canceled' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async delivery(req, res, next) {
        try {
            const { id } = req.body;
            const order = await Order.findOne({ where: { id } });
            if (!order) {
                return next(ApiError.badRequest("order doesn't exist"));
            }
            if (order.canceled) {
                return res.json({ message: 'order already canceled' });
            }
            await Order.update({ delivered: true }, { where: { id } });

            return res.json({ message: 'order delivered' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async hide(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.body;
            const order = await Order.findOne({ where: { id, userId, hidden: false } });
            if (!order) {
                return next(ApiError.badRequest("order doesn't exist"));
            }
            await Order.update({ hidden: true }, { where: { id } });

            return res.json({ message: 'order hidden' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new OrderController();

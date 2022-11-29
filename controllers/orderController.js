const { Op } = require('sequelize');
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
                await OrderDevice.create({
                    orderId: order.id,
                    deviceId: findedDevice.id,
                    count: device.count,
                    price: findedDevice.price,
                });
                await Basket.destroy({ where: { userId, deviceId: findedDevice.id } });
            });

            return res.json(order);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAllManager(req, res, next) {
        try {
            let { page, canceled, delivered, userId, dateFrom, dateTo } = req.query;
            page = page || 1;
            const limit = 8;
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
            if (dateTo) {
                dateTo += 'T20:59:59.999Z';
            } else {
                dateTo = new Date();
            }
            if (dateFrom) {
                dateFrom += 'T00:00:00.000Z';
            } else {
                dateFrom = '1970-01-01T00:00:00.000Z';
            }
            const orders = await Order.findAndCountAll({
                where: { ...params, orderDate: { [Op.between]: [dateFrom, dateTo] } },
                include: { model: User },
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
            let { page, canceled, delivered } = req.query;
            const limit = 8;
            page = page || 1;
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
                include: { model: User },
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
            const user = await User.findOne({ where: { id: userId } });
            let order;
            if (user.role === 'MANAGER') {
                order = await Order.findOne({
                    where: { id },
                    include: [
                        { model: OrderDevice, include: { model: Device, include: { model: Brand } } },
                        { model: User },
                    ],
                });
                if (!order) {
                    return next(ApiError.badRequest("order doesn't exist"));
                }
            } else {
                order = await Order.findOne({
                    where: { id, userId },
                    include: { model: OrderDevice, include: { model: Device, include: { model: Brand } } },
                });
                if (!order || order.hidden) {
                    return next(ApiError.badRequest("order doesn't exist"));
                }
            }

            return res.json(order);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async deliveryStatusManager(req, res, next) {
        try {
            const { id, status } = req.body;
            console.log(id, status);
            const order = await Order.findOne({ where: { id } });
            if (status === 'in delivery') {
                if (order.canceled || order.delivered) {
                    let deliveryDate = new Date();
                    deliveryDate = deliveryDate.setDate(deliveryDate.getDate() + 2);
                    order.deliveryDate = deliveryDate;
                }
                order.delivered = false;
                order.canceled = false;
            } else if (status === 'delivered') {
                order.delivered = true;
                order.canceled = false;
                let deliveryDate = new Date();
                order.deliveryDate = deliveryDate;
            } else {
                order.delivered = false;
                order.canceled = true;
            }
            order.save();

            return res.json({ message: "order's status changed" });
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
            order.canceled = true;
            order.save();

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
            order.delivered = true;
            order.save();

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
            order.hidden = true;
            order.save();

            return res.json({ message: 'order hidden' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new OrderController();

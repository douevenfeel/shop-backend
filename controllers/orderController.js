const ApiError = require('../error/ApiError');
const { User, Device, Order, OrderDevice, Basket } = require('../models/models');

class OrderController {
    async create(req, res, next) {
        try {
            let { receiverFirstName, receiverLastName } = req.body;
            const { address } = req.body;
            const { id } = req.params;
            const user = await User.findOne({ where: { id } });
            receiverFirstName = receiverFirstName || user.firstName;
            receiverLastName = receiverLastName || user.lastName;
            const basket = await Basket.findAll({ where: { userId: user.id, selected: true } });
            const orderDate = new Date();
            let deliveryDate = new Date();
            deliveryDate = deliveryDate.setDate(deliveryDate.getDate() + 2);
            if (basket.length === 0) {
                return res.json({ message: 'empty basket' });
            }
            let order = await Order.create({
                address,
                receiverFirstName,
                receiverLastName,
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
                await Basket.destroy({ where: { userId: user.id, deviceId: findedDevice.id } });
            });
            order = await Order.findOne({
                where: { id: order.id },
            });

            return res.json(order);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAllAdmin(req, res, next) {
        try {
            let { limit, page, canceled, delivered } = req.query;
            page = page || 1;
            limit = limit || 6;
            let offset = page * limit - limit;
            let orders;
            if (canceled && delivered) {
                return next(ApiError.badRequest('error'));
            }
            if (!canceled && !delivered) {
                orders = await Order.findAndCountAll({
                    order: [['orderDate', 'DESC']],
                    page,
                    limit,
                    offset,
                });
            } else if (canceled) {
                orders = await Order.findAndCountAll({
                    where: { canceled },
                    order: [['orderDate', 'DESC']],
                    page,
                    limit,
                    offset,
                });
            } else if (delivered) {
                orders = await Order.findAndCountAll({
                    where: { delivered },
                    order: [['orderDate', 'DESC']],
                    page,
                    limit,
                    offset,
                });
            }
            return res.json(orders);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAll(req, res, next) {
        try {
            const { userId } = req.params;
            let { limit, page, canceled, delivered } = req.query;
            page = page || 1;
            limit = limit || 6;
            let offset = page * limit - limit;
            let orders;
            if (canceled && delivered) {
                return next(ApiError.badRequest('error'));
            }
            if (!canceled && !delivered) {
                orders = await Order.findAndCountAll({
                    where: { userId, hidden: false },
                    order: [['orderDate', 'DESC']],
                    page,
                    limit,
                    offset,
                });
            } else if (canceled) {
                orders = await Order.findAndCountAll({
                    where: { userId, hidden: false, canceled },
                    order: [['orderDate', 'DESC']],
                    page,
                    limit,
                    offset,
                });
            } else if (delivered) {
                orders = await Order.findAndCountAll({
                    where: { userId, hidden: false, delivered },
                    order: [['orderDate', 'DESC']],
                    page,
                    limit,
                    offset,
                });
            }
            return res.json(orders);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const order = await Order.findOne({ where: { id }, include: { model: OrderDevice } });
            if (order.hidden) {
                return next(ApiError.badRequest("order doesn't exist"));
            }

            return res.json(order);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async cancel(req, res, next) {
        try {
            const { id } = req.params;
            const order = await Order.findOne({ where: { id } });
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
            const { id } = req.params;
            const order = await Order.findOne({ where: { id } });
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
            const { id } = req.params;
            const order = await Order.findOne({ where: { id } });
            if (order.hidden) {
                return res.json({ message: 'order already hidden' });
            }
            await Order.update({ hidden: true }, { where: { id } });

            return res.json({ message: 'order hidden' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new OrderController();

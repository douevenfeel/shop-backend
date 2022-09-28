const { Device, Brand, Info, DeviceInfo } = require('../models/models');
const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/ApiError');

class DeviceController {
    async create(req, res, next) {
        try {
            const { brandTitle, title, price, info } = req.body;
            const { image } = req.files;
            let fileName = uuid.v4() + '.png';
            image.mv(path.resolve(__dirname, '..', 'static', fileName));
            const findedBrand = await Brand.findOne({ where: { title: brandTitle } });
            let device;
            if (findedBrand) {
                device = await Device.create({ brandId: findedBrand.id, title, price, image: fileName });
            } else {
                const brand = await Brand.create({ where: { title: brandTitle } });
                device = await Device.create({ brandId: brand.dataValues.id, title, price, image: fileName });
            }
            if (info) {
                JSON.parse(info).forEach(async (i) => {
                    const [info, infoCreated] = await Info.findOrCreate({
                        where: { title: i.title, content: i.content },
                    });
                    DeviceInfo.create({ deviceId: device.id, infoId: info.dataValues.id });
                });
            }

            return res.json(device);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAll(req, res) {
        try {
            let { limit, page, orderBy, orderType } = req.query;
            page = page || 1;
            limit = limit || 6;
            let order = (orderBy && orderType && [orderBy, orderType]) || ['image', 'DESC'];
            order = [['available', 'DESC'], order];
            let offset = page * limit - limit;
            const devices = await Device.findAndCountAll({
                page,
                limit,
                offset,
            });

            return res.json(devices);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const device = await Device.findOne({
                where: { id },
                include: [{ model: Brand }, { model: DeviceInfo, include: { model: Info } }],
            });

            return res.json(device);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updateAvailable(req, res, next) {
        try {
            const { id } = req.params;
            const { available } = req.body;
            await Device.update({ available: available }, { where: { id } });

            return res.json({ message: 'Доступность товара изменена' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updatePrice(req, res, next) {
        try {
            const { id } = req.params;
            const { price } = req.body;
            await Device.update({ price: price }, { where: { id } });

            return res.json({ message: 'Стоимость товара обновлена' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async addDiscount(req, res, next) {
        try {
            const { id } = req.params;
            const { price } = req.body;
            const device = await Device.findOne({ where: { id } });
            await Device.update({ price, oldPrice: device.price }, { where: { id } });

            return res.json({ message: 'device discount added' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updateDiscount(req, res, next) {
        try {
            const { id } = req.params;
            const { price } = req.body;
            await Device.update({ price }, { where: { id } });

            return res.json({ message: 'device discount updated' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async removeDiscount(req, res, next) {
        try {
            const { id } = req.params;
            const device = await Device.findOne({ where: { id } });
            await Device.update({ price: device.oldPrice, oldPrice: 0 }, { where: { id } });

            return res.json({ message: 'device discount removed' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await Device.destroy({ where: { id } });

            return res.json({ message: 'Товар удален' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new DeviceController();

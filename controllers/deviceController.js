const { Device, Brand, Info, InfoCategory } = require('../models/models');
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
                const { id } = await Brand.create({ title: brandTitle });
                device = await Device.create({ brandId: id, title, price, image: fileName });
            }
            if (info) {
                JSON.parse(info).forEach(async (c) => {
                    const infoCategory = await InfoCategory.create({ title: c.infoCategory, deviceId: device.id });
                    c.info.forEach(async (i) => {
                        await Info.create({ title: i.title, content: i.content, infoCategoryId: infoCategory.id });
                    });
                });
            }

            return res.json(device);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getAll(req, res, next) {
        try {
            let { limit, page, orderBy, orderType, brandTitle } = req.query;
            page = page || 1;
            limit = limit || 6;
            let order = (orderBy && orderType && [orderBy, orderType]) || ['image', 'DESC'];
            order = [['available', 'DESC'], order];
            let offset = page * limit - limit;
            let devices;
            if (brandTitle !== undefined) {
                const { id } = await Brand.findOne({ where: { title: brandTitle } });
                devices = await Device.findAndCountAll({
                    where: { brandId: id },
                    order,
                    page,
                    limit,
                    offset,
                });
            } else {
                devices = await Device.findAndCountAll({
                    order,
                    page,
                    limit,
                    offset,
                });
            }

            return res.json(devices);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const device = await Device.findOne({
                where: { id },
                include: { model: InfoCategory, include: { model: Info, order: [['info-categories.id', 'ASC']] } },
            });

            return res.json(device);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async addCategory(req, res, next) {
        try {
            const { deviceId } = req.params;
            const { infoCategoryTitle } = req.body;
            const infoCategory = await InfoCategory.create({ deviceId, title: infoCategoryTitle });

            return res.json(infoCategory);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async addInfo(req, res, next) {
        try {
            const { infoCategoryId } = req.params;
            const { title, content } = req.body;
            const info = await Info.create({ title, content, infoCategoryId });

            return res.json(info);
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

    async updateCategoryTitle(req, res, next) {
        try {
            const { infoCategoryId } = req.params;
            const { infoCategoryTitle } = req.body;
            await InfoCategory.update({ title: infoCategoryTitle }, { where: { id: infoCategoryId } });

            return res.json({ message: 'info category title updated' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            const infoCategory = await InfoCategory.findAll({ where: { deviceId: id } });
            infoCategory.forEach(async (ic) => {
                await Info.destroy({ where: { infoCategoryId: ic.id } });
            });
            await InfoCategory.destroy({ where: { deviceId: id } });
            await Device.destroy({ where: { id } });

            return res.json({ message: 'Товар удален' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async removeCategory(req, res, next) {
        try {
            const { infoCategoryId } = req.params;
            await Info.destroy({ where: { infoCategoryId } });
            await InfoCategory.destroy({ where: { id: infoCategoryId } });

            return res.json({ message: 'info category deleted' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new DeviceController();

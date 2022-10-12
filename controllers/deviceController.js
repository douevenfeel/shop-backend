const { Device, Brand, Info, Category } = require('../models/models');
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
                    const category = await Category.create({ title: c.category, deviceId: device.id });
                    c.info.forEach(async (i) => {
                        await Info.create({ title: i.title, content: i.content, categoryId: category.id });
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
            let { page, order, brandTitle } = req.query;
            const limit = 12;
            page = page || 1;
            order = [['available', 'DESC'], order];
            let offset = page * limit - limit;
            let devices;
            brandTitle = brandTitle || 'all';
            if (brandTitle !== 'all') {
                const { id } = await Brand.findOne({ where: { title: brandTitle } });
                devices = await Device.findAndCountAll({
                    where: { brandId: id },
                    order,
                    page,
                    limit,
                    offset,
                    include: { model: Brand },
                });
            } else {
                devices = await Device.findAndCountAll({
                    order,
                    page,
                    limit,
                    offset,
                    include: { model: Brand },
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
                include: [{ model: Brand }, { model: Category, include: { model: Info } }],
            });
            if (!device) {
                return next(ApiError.badRequest("device doesn't exist"));
            }

            return res.json(device);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async createCategory(req, res, next) {
        try {
            const { deviceId, categoryTitle } = req.body;
            const device = await Device.findOne({ where: { id: deviceId } });
            if (!device) {
                return next(ApiError.badRequest("device doesn't exist"));
            }
            const category = await Category.create({ deviceId, title: categoryTitle });

            return res.json(category);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async createInfo(req, res, next) {
        try {
            const { categoryId, title, content } = req.body;
            const category = await Category.findOne({ where: { id: categoryId } });
            if (!category) {
                return next(ApiError.badRequest("category doesn't exist"));
            }
            const info = await Info.create({ title, content, categoryId });

            return res.json(info);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updateAvailable(req, res, next) {
        try {
            const { id, available } = req.body;
            const device = await Device.findOne({ where: { id } });
            if (!device) {
                return next(ApiError.badRequest("device doesn't exist"));
            }
            device.available = available;
            device.save();

            return res.json({ message: "device's available updated" });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updatePrice(req, res, next) {
        try {
            const { id, price } = req.body;
            const device = await Device.findOne({ where: { id } });
            if (!device) {
                return next(ApiError.badRequest("device doesn't exist"));
            }
            if (device.oldPrice === 0) {
                device.price = price;
            } else {
                device.oldPrice = price;
            }
            device.save();

            return res.json({ message: "device's price updated" });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updateDiscount(req, res, next) {
        try {
            const { id, price } = req.body;
            const device = await Device.findOne({ where: { id } });
            if (!device) {
                return next(ApiError.badRequest("device doesn't exist"));
            }
            if (device.oldPrice === 0) {
                device.oldPrice = device.price;
                device.price = price;
            } else {
                device.price = price;
            }
            device.save();

            return res.json({ message: 'device discount updated' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async removeDiscount(req, res, next) {
        try {
            const { id } = req.body;
            const device = await Device.findOne({ where: { id } });
            if (!device) {
                return next(ApiError.badRequest("device doesn't exist"));
            }
            if (device.oldPrice === 0) {
                return next(ApiError.badRequest("device doesn't have discount"));
            }
            device.price = device.oldPrice;
            device.oldPrice = 0;
            device.save();

            return res.json({ message: 'device discount removed' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async updateCategoryTitle(req, res, next) {
        try {
            const { id, categoryTitle } = req.body;
            const category = await Category.findOne({ where: { id } });
            if (!category) {
                return next(ApiError.badRequest("category doesn't exist"));
            }
            category.title = categoryTitle;
            category.save();

            return res.json({ message: 'info category title updated' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async removeCategory(req, res, next) {
        try {
            const { categoryId } = req.body;
            await Info.destroy({ where: { categoryId } });
            await Category.destroy({ where: { id: categoryId } });

            return res.json({ message: 'info category deleted' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    async removeInfo(req, res, next) {
        try {
            const { id } = req.body;
            await Info.destroy({ where: { id } });

            return res.json({ message: 'info deleted' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
}

module.exports = new DeviceController();

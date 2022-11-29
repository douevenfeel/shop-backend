const { Device, Brand, Info, Category } = require('../models/models');
const uuid = require('uuid');
const path = require('path');
const ApiError = require('../error/ApiError');
const { Op, INTEGER } = require('sequelize');

class DeviceController {
    async create(req, res, next) {
        try {
            const { brandTitle, price, info } = req.body;
            let { title } = req.body;
            title = `${brandTitle} ${title}`;
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
            let { page, order, brandTitle, title, fromPrice, toPrice } = req.query;
            const limit = 12;
            page = page || 1;
            order = [order];
            let offset = page * limit - limit;
            let devices;
            title = title || 'all';
            brandTitle = brandTitle || 'all';
            fromPrice = +fromPrice;
            toPrice = +toPrice !== 0 ? toPrice : Number.MAX_SAFE_INTEGER;
            if (brandTitle !== 'all') {
                const { id } = await Brand.findOne({ where: { title: brandTitle } });
                if (title !== 'all') {
                    devices = await Device.findAndCountAll({
                        where: {
                            brandId: id,
                            title: { [Op.iLike]: `%${title}%` },
                            price: { [Op.between]: [fromPrice, toPrice] },
                        },
                        order,
                        page,
                        limit,
                        offset,
                        include: { model: Brand },
                    });
                } else {
                    devices = await Device.findAndCountAll({
                        where: { brandId: id, price: { [Op.between]: [fromPrice, toPrice] } },
                        order,
                        page,
                        limit,
                        offset,
                        include: { model: Brand },
                    });
                }
            } else {
                if (title !== 'all') {
                    devices = await Device.findAndCountAll({
                        where: { title: { [Op.iLike]: `%${title}%` }, price: { [Op.between]: [fromPrice, toPrice] } },
                        order,
                        page,
                        limit,
                        offset,
                        include: { model: Brand },
                    });
                } else {
                    devices = await Device.findAndCountAll({
                        where: { price: { [Op.between]: [fromPrice, toPrice] } },
                        order,
                        page,
                        limit,
                        offset,
                        include: { model: Brand },
                    });
                }
            }
            let minPrice = Number.MAX_SAFE_INTEGER;
            let maxPrice = 0;
            devices.rows.forEach((device) => {
                minPrice = Math.min(device.price, minPrice);
                maxPrice = Math.max(device.price, maxPrice);
                return device.price;
            });

            if (minPrice === Number.MAX_SAFE_INTEGER) {
                minPrice = 0;
            }

            return res.json({ ...devices, minPrice, maxPrice });
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

    async update(req, res, next) {
        try {
            console.log('ds');
            const { id, title, price, brandTitle } = req.body;
            let brand = await Brand.findOne({ where: { title: brandTitle } });
            const device = await Device.findOne({ where: id });
            if (!brand) {
                brand = await Brand.create({ title: brandTitle });
            }
            device.brandId = brand.dataValues.id;
            device.title = title;
            device.price = price;
            device.save();

            return res.json({ message: 'device updated' });
        } catch (error) {
            console.log(error);
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

    async updateInfo(req, res, next) {
        try {
            const { id, title, content } = req.body;
            const info = await Info.findOne({ where: { id } });
            info.title = title;
            info.content = content;
            info.save();

            return res.json({ message: 'info updated' });
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

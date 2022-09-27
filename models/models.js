const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'ADMIN' },
});

const Token = sequelize.define('token', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    refreshToken: { type: DataTypes.STRING },
});

const Device = sequelize.define('device', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER },
    image: { type: DataTypes.STRING },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const Info = sequelize.define('info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    content: { type: DataTypes.STRING },
});

const DeviceInfo = sequelize.define('device-info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const Basket = sequelize.define('basket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const BasketDevice = sequelize.define('basket-device', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    count: { type: DataTypes.INTEGER },
});

const Order = sequelize.define('order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    address: { type: DataTypes.STRING },
    receiverFirstName: { type: DataTypes.STRING },
    receiverLastName: { type: DataTypes.STRING },
    orderDate: { type: DataTypes.DATE },
    deliveryDate: { type: DataTypes.DATE },
    delivered: { type: DataTypes.BOOLEAN, defaultValue: false },
    canceled: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Brand = sequelize.define('brand', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
});

User.hasOne(Token);
Token.belongsTo(User);

Basket.hasOne(User);
User.belongsTo(Basket);

Brand.hasMany(Device);
Device.belongsTo(Brand);

Device.hasMany(DeviceInfo);
DeviceInfo.belongsTo(Device);

Info.hasMany(DeviceInfo);
DeviceInfo.belongsTo(Info);

Basket.hasMany(BasketDevice);
BasketDevice.belongsTo(Basket);

Device.hasMany(BasketDevice);
BasketDevice.belongsTo(Device);

User.hasMany(Order);
Order.belongsTo(User);

Basket.hasOne(Order);
Order.belongsTo(Basket);

module.exports = { User, Token, Device, DeviceInfo, Basket, BasketDevice, Brand, Order, Info };

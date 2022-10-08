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
    oldPrice: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const Category = sequelize.define('category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
});

const Info = sequelize.define('info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    content: { type: DataTypes.STRING },
});

const Basket = sequelize.define('basket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    count: { type: DataTypes.INTEGER, defaultValue: 1 },
    selected: { type: DataTypes.BOOLEAN, defaultValue: true },
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
    hidden: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const OrderDevice = sequelize.define('orderDevice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: DataTypes.INTEGER },
    count: { type: DataTypes.INTEGER },
});

const Brand = sequelize.define('brand', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, unique: true },
});

User.hasOne(Token);
Token.belongsTo(User);

User.hasOne(Basket);
Basket.belongsTo(User);

Brand.hasMany(Device);
Device.belongsTo(Brand);

Device.hasMany(Category);
Category.belongsTo(Device);

Category.hasMany(Info);
Info.belongsTo(Category);

Device.hasMany(Basket);
Basket.belongsTo(Device);

User.hasMany(Order);
Order.belongsTo(User);

Device.hasMany(OrderDevice);
OrderDevice.belongsTo(Device);

Order.hasMany(OrderDevice);
OrderDevice.belongsTo(Order);

module.exports = {
    User,
    Token,
    Device,
    Brand,
    Category,
    Info,
    Basket,
    Order,
    OrderDevice,
};

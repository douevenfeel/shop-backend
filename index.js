const express = require('express');
require('dotenv').config();
const sequelize = require('./db');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandlingMiddleware');
const path = require('path');

const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const Connect = require('connect-pg-simple');
const session = require('express-session');
const AdminJSSequelize = require('@adminjs/sequelize');
const { User, Token, Device, Brand, Category, Info, Basket, Order, OrderDevice } = require('./models/models');

const PORT = process.env.PORT || 5000;

const app = express();

AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
});

app.use(cors({ credentials: true, origin: process.env.CLIENT_APP_URL }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);

app.use(errorHandler);

const DEFAULT_ADMIN = {
    email: 'admin@example.com',
    password: 'password',
};

const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
};

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const adminOptions = { resources: [User, Token, Device, Brand, Category, Info, Basket, Order, OrderDevice] };
        const admin = new AdminJS(adminOptions);

        const ConnectSession = Connect(session);
        const sessionStore = new ConnectSession({
            conObject: {
                connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
                ssl: false,
            },
            tableName: 'session',
            createTableIfMissing: true,
        });

        const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
            admin,
            {
                authenticate,
                cookieName: 'adminjs',
                cookiePassword: 'sessionsecret',
            },
            null,
            {
                store: sessionStore,
                resave: true,
                saveUninitialized: true,
                secret: 'sessionsecret',
                cookie: {
                    httpOnly: process.env.NODE_ENV === 'production',
                    secure: process.env.NODE_ENV === 'production',
                },
                name: 'adminjs',
            }
        );
        app.use(admin.options.rootPath, adminRouter);

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();

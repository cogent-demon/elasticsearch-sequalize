"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mysql',
    host: process.env.HOST,
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    models: [__dirname + '/models'],
    sync: { force: true, alter: true },
    logging: false
});
exports.default = sequelize;
//# sourceMappingURL=db.js.map
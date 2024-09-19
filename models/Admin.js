// models/Admin.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Admin extends Model {}

Admin.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Assuming auto-increment
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Admin',
        tableName: 'admins',
        timestamps: false,
    }
);

module.exports = Admin;

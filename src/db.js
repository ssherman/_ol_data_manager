// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tgb', 'postgres', 'postgres_password', {
  host: 'localhost',
  port: '6543',
  dialect: 'postgres'
});

module.exports = sequelize;
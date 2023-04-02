const { Sequelize } = require('sequelize')

const DB_NAME = process.env.DB_NAME
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || '6543'

if (!DB_NAME) {
  throw new Error('DB_NAME environment variable is required')
}

if (!DB_USER) {
  throw new Error('DB_USER environment variable is required')
}

if (!DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required')
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres'
})

module.exports = sequelize

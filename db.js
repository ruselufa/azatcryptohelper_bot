const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'cryptohelpertgbot',
    'amber',
    'VZizwWS8NPgu',
    {
        host: '188.246.228.181',
        port: '6432',
        dialect: 'postgres'
    }
)
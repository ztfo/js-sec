const { Sequelize} = require('sequelize');

const sequelize = new Sequelize('user', 'username', 'password', {
    host: 'localhost',
    dialect: 'postgres'
}); 

module.exports = sequelize;
const { DataTypes } = require('sequelize');
const sequelize = require('./index');

sequelize
  .authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch((error) => console.error('Unable to connect to the database:', error));

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
});

User.sync();

module.exports = User;

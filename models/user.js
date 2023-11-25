const { DataTypes } = require('sequelize');
const sequelize = require('./index');

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
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
});

User.sync()

module.exports = User;

module.exports = (sequelize, DataTypes) => {
    const Budget = sequelize.define('Budget', {
        userId: DataTypes.UUID,
        budget: DataTypes.DOUBLE,
        timeframe: DataTypes.STRING,
    }, {});

    Budget.associate = function(models) {
        Budget.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Budget;
};
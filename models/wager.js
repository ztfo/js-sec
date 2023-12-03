module.exports = (sequelize, DataTypes) => {
    const Wager = sequelize.define('Wager', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'User',
                key: 'userId',
            },
        },
    }, {
        timestamps: true,
    });

    Wager.associate = function(models) {
        Wager.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Wager;
};
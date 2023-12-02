const { Budget } = require('./models/index');

async function createBudget() {
    const newBudget = await Budget.create({
        userId: '81a824d1-7711-434c-82b4-65b5a42acff2',
        budget: 1000.00,
        timeframe: '1 month',
    });

    console.log(newBudget.toJSON());
}

createBudget().catch(console.error);
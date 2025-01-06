const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    payed: {
        type: Boolean,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    items: [{
        categoryId: {
            type: Number,
            required: true
        },
        dishId: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        dish: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    code: {
        type: String,
        required: true
    }
});

const BasketModel = mongoose.model('Basket', basketSchema);
module.exports = BasketModel;

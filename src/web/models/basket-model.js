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
    items: [{
        category: {
            type: Number,
            required: true
        },
        dish: {
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

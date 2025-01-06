const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        required: true 
    },
    payed: {
        type: Boolean,
        required: true
    },
    actualAmount: {
        type: Number,
        required: true
    }
});

const PaymentModel = mongoose.model('Payment', paymentSchema);
module.exports = PaymentModel;

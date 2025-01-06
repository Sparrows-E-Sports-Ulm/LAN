require('dotenv').config();
const express = require('express')
const crypto = require('crypto');
const mongoose = require('mongoose');
const app = express();
const { ImapFlow } = require('imapflow');
const PaymentModel = require('./models/payment-model');
const simpleParser = require('mailparser').simpleParser;

const CODE_LENGTH = process.env.PAYPAL_PREFIX.length + 6;

// Setup Database Connection
mongoose.connect('mongodb://localhost:27017/payments');
mongoose.connection.once('open', () => {
    console.log('Connected to Database!');
});
mongoose.connection.on("error", (err) => {
    console.error(`Database Connection Error: ${err}`);
});

// Setup API
app.use(express.json());

app.get('/', (req, res) => {
    res.json('The cake is a lie');
});

app.post('/api/payment/status', async (req, res, next) => {
    const code = req.body.code;
    if(!code || typeof code !== 'string' || code.length != CODE_LENGTH) {
        res.status(400).json({error: true, message: 'Invalid Request: code'});
        return;
    }

    const payment = await PaymentModel.findOne({code: code}).catch(next);

    if(!payment) {
        res.status(404).json({error: true, message: 'Unknown Code'});
        return;
    }

    res.json({payed: payment.payed});
});

app.post('/api/payment/create', (req, res) => {
    const amount = req.body.amount;
    const code = process.env.PAYPAL_PREFIX + crypto.randomBytes(3).toString('hex').toUpperCase();

    if(!amount || typeof amount !== 'number') {
        res.status(400).json({error: true, message: 'Invalid Request: amount'});
        return;
    }

    const payment = new PaymentModel();
    payment.code = code;
    payment.amount = amount;
    payment.payed = false;
    payment.actualAmount = 0;
    payment.save();

    res.json({
        code: code
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: true});
});

app.listen(process.env.PAYMENT_SERVICE_PORT, () => {
    console.log(`Running Payment Service on port ${process.env.PAYMENT_SERVICE_PORT}`)
});

// Setup Mail Client
const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: process.env.IMAP_PORT,
    secure: true,
    auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS
    }
})

const amountPattern = /hast\s(\d+,\d+)\s€/i;
const codePattern = new RegExp(`(${process.env.PAYPAL_PREFIX}[\\w]*)`);
async function handleMail(envelope, source) {
    if(envelope.from.length != 1 /*|| envelope.from[0].address != 'service@paypal.de'*/) {
        return;
    }

    // Parse amount 
    const amountMatches = amountPattern.exec(source.text);
    if(!amountMatches || amountMatches.length < 2) { return; }
    const amount = parseFloat(amountMatches[1].replace(',', '.'));
    
    // Parse code
    const codeMatches = codePattern.exec(source.text);
    if(!codeMatches || codeMatches.length < 2) { return; }
    const code = codeMatches[1];

    if(code.length != CODE_LENGTH) { return; }

    // Find Payment
    const payment = await PaymentModel.findOne({code: code});
    if(!payment) { return; } // TODO: Record unknown payments

    if(payment.amount > amount) {
        return; // TODO: handle this case
    }

    payment.actualAmount = amount;
    payment.payed = true;
    payment.save();
}

async function connect() {
    await client.connect();
    await client.mailboxOpen(process.env.IMAP_INBOX);
    
    client.on('exists', async (data) => {
        const count = data.count - data.prevCount;
        console.log(`Recieved ${count} new mail(s)`);

        const messages = await client.fetchAll(`${data.prevCount+1}:${data.count}`, {source: true, envelope: true});
        for (message of messages) {
            const parsed = await simpleParser(message.source);
            await handleMail(message.envelope, parsed).catch(console.error);
        }
    });
}

connect().catch(console.error);


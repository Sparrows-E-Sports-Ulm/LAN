
const { ImapFlow } = require('imapflow');
const BasketModel = require('../models/basket-model');
const simpleParser = require('mailparser').simpleParser;
const crypto = require('crypto');
const CODE_LENGTH = process.env.PAYPAL_PREFIX.length + 6;

function createPaymentCode() {
    return process.env.PAYPAL_PREFIX + crypto.randomBytes(3).toString('hex').toUpperCase();
}

function setupMailHandler() {
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

    // Handle Incomming Mail
    const amountPattern = /hast\s(\d+,\d+)\s€/i;
    const codePattern = new RegExp(`(${process.env.PAYPAL_PREFIX}[\\w]*)`);
    async function handleMail(envelope, source) {
        if (envelope.from.length != 1 /*|| envelope.from[0].address != 'service@paypal.de'*/) {
            return;
        }

        // Parse amount 
        const amountMatches = amountPattern.exec(source.text);
        if (!amountMatches || amountMatches.length < 2) { return; }
        const amount = parseFloat(amountMatches[1].replace(',', '.'));

        // Parse code
        const codeMatches = codePattern.exec(source.text);
        if (!codeMatches || codeMatches.length < 2) { return; }
        const code = codeMatches[1];

        if (code.length != CODE_LENGTH) { 
            console.error(`Invalid Code Length: ${code}`);
            return; 
        }

        // Find Payment
        const basket = await BasketModel.findOne({ code: code });
        if (!basket) { return; } // TODO: Record unknown payments

        if (basket.total > amount) {
            return; // TODO: handle this case
        }

        basket.payed = true;
        basket.save();
    }

    // Connect to IMAP Server
    async function connect() {
        await client.connect();
        await client.mailboxOpen(process.env.IMAP_INBOX);

        client.on('exists', async (data) => {
            const count = data.count - data.prevCount;
            console.log(`Recieved ${count} new mail(s)`);

            const messages = await client.fetchAll(`${data.prevCount + 1}:${data.count}`, { source: true, envelope: true });
            for (message of messages) {
                const parsed = await simpleParser(message.source);
                await handleMail(message.envelope, parsed).catch(console.error);
            }
        });
    }

    connect().catch(console.error);
}

module.exports = {
    setup: setupMailHandler,
    createCode: createPaymentCode
}

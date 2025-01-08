
const { ImapFlow } = require('imapflow');
const BasketModel = require('../models/basket-model');
const simpleParser = require('mailparser').simpleParser;
const crypto = require('crypto');
const CODE_LENGTH = process.env.PAYPAL_PREFIX.length + 6;
const logger = require('../util/logger');

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
        },
        logger: {
            debug: (msg) => console.log(`[MAIL]: ${msg.msg}`),
            info: (msg) => logger.info(`[MAIL]: ${msg.msg}`),
            warn: (msg) => logger.warn(`[MAIL]: ${msg.msg}`),
            error: (msg) => logger.err(`[MAIL]: ${msg.msg}`),
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
        if (!amountMatches || amountMatches.length < 2) { 
            logger.warn(`[MAIL]: Received Payment but could not parse amount`);
            return; 
        }
        const amount = parseFloat(amountMatches[1].replace(',', '.'));

        // Parse code
        const codeMatches = codePattern.exec(source.text);
        if (!codeMatches || codeMatches.length < 2) { 
            logger.warn(`[MAIL]: Received Payment but could not parse code`);
            return; 
        }
        const code = codeMatches[1];

        if (code.length != CODE_LENGTH) { 
            logger.warn(`[MAIL]: Invalid Code Length: ${code}`);
            return; 
        }

        // Find Payment
        const basket = await BasketModel.findOne({ code: code });
        if (!basket) { 
            logger.warn(`[MAIL]: Received Payment with code: ${code}, but the code is unknown!\nAmount: ${amount}`);
            return; 
        } // TODO: Record unknown payments

        if (basket.total > amount) {
            logger.warn(`[MAIL]: Received too little money\nCode: ${code}\nAmount: ${amount}\nExpected Amount: ${basket.total}`);
            return; // TODO: handle this case
        }

        basket.payed = true;
        basket.save();

        logger.log(`[MAIL]: Payment Accepted: ${code}`);
    }

    // Connect to IMAP Server
    async function connect() {
        logger.info('[MAIL]: Trying to connect to IMAP Server');
        await client.connect();
        await client.mailboxOpen(process.env.IMAP_INBOX);
        logger.log(`[MAIL]: Connected to IMAP Mailbox`);

        client.on('exists', async (data) => {
            const count = data.count - data.prevCount;
            logger.info(`[MAIL]: Recieved ${count} new mail(s)`);

            const messages = await client.fetchAll(`${data.prevCount + 1}:${data.count}`, { source: true, envelope: true });
            for (message of messages) {
                const parsed = await simpleParser(message.source);
                await handleMail(message.envelope, parsed).catch(console.error);
            }
        });
    }

    connect().catch((err) => logger.err(`[MAIL]: ${err}`));
}

module.exports = {
    setup: setupMailHandler,
    createCode: createPaymentCode
}

const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.DC_WEBHOOK);

function log(msg) {
    console.log(`[✅] ${msg}`);
    hook.send(`[✅] ${msg}`);
}

function err(msg) {
    console.error(`[❌] ${msg}`);
    hook.send(`[❌] ${msg}`);
}

function info(msg) {
    console.log(`[ℹ️] ${msg}`);
    hook.send(`[ℹ️] ${msg}`);
}

function warn(msg) {
    console.log(`[⚠️] ${msg}`);
    hook.send(`[⚠️] ${msg}`);
}

module.exports = {
    log: log,
    err: err,
    info: info,
    warn: warn
};
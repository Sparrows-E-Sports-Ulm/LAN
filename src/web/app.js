require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { Edge } = require('edge.js');
const iconify = require('edge-iconify');
const heroIcons = require('@iconify-json/heroicons').icons;
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const paymentService = require('./services/payment-service');
const basicAuth = require('express-basic-auth');
const logger = require('./util/logger');

// Setup Database Connection
mongoose.connect('mongodb://localhost:27017/orders');
mongoose.connection.once('open', () => {
    logger.log('[DB]: Connected to Database!');
});
mongoose.connection.on("error", (err) => {
    logger.err(`[DB]: Database Connection Error: ${err}`);
});

// Setup Payment Service
paymentService.setup();

// Setup Express
const app = express();

// Setup edge for the view engine
const edge = Edge.create({cache: process.env.NODE_ENV !== 'development'});
iconify.addCollection(heroIcons);
edge.use(iconify.edgeIconify);
edge.mount(app.settings.views)
app.engine('edge', async (path, options, callback) => {
    callback(null, await edge.render(path, options));
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'edge');

// Setup Middleware
app.use(session({
    secret: process.env.COOKIE_SECRET,
    cookie: {maxAge: new Date(253402300000000)}, // Never Expire
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: 'orders'
    })
}));

//app.use(require('morgan')('dev'));
app.use(express.json());

// Setup Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// Setup Routes
app.use('/',      require('./routes/index'));
app.use('/order', require('./routes/order'));
app.use('/admin', basicAuth({
    users: { 'admin': process.env.ADMIN_PWD},
    challenge: true
}), require('./routes/admin'));


// Setup Error Handlers
app.use((err, req, res, next) => {
    logger.err(`[WEB]: ${err.stack}`);
    res.status(500).send('Something broke!');
});

app.listen(process.env.WEB_PORT, () => {
    logger.log(`[WEB]: Running Web Interface on port ${process.env.WEB_PORT}`);
});


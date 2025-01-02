require('dotenv').config();
const express = require('express')

const app = express()

app.use(express.json());

app.get('/', (req, res) => {
    res.json('The cake is a lie');
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: true});
});

app.listen(process.env.PAYMENT_SERVICE_PORT, () => {
    console.log(`Running Payment Service on port ${process.env.PAYMENT_SERVICE_PORT}`)
});


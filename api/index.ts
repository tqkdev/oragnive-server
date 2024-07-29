const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// const productRoute = require('./routes/product');
// const categoryRoute = require('./routes/category');
// const searchRoute = require('./routes/search');
// const userRoute = require('./routes/user');
// const adminRoute = require('./routes/admin');
// const orderRoute = require('./routes/order');
const productRoute = require('../routes/product');
const categoryRoute = require('../routes/category');
const searchRoute = require('../routes/search');
const userRoute = require('../routes/user');
const adminRoute = require('../routes/admin');
const orderRoute = require('../routes/order');

dotenv.config();
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

// Cấu hình CORS
app.use(
    cors({
        origin: process.env.REACT_URL,
        credentials: true,
        exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
    }),
);

app.use(morgan('common'));
app.use(cookieParser());

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('connect DB successfully!!!');
    } catch (error) {
        console.log('connect DB failure!!!');
        console.log(error);
    }
}
connect();

// ROUTES
app.use('/api/product', productRoute);
app.use('/api/category', categoryRoute);
app.use('/api/search', searchRoute);
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/order', orderRoute);

const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Server is running....');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

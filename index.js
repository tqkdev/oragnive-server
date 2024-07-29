// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// var bodyParser = require('body-parser');
// const morgan = require('morgan');
// const dotenv = require('dotenv');
// const cookiparser = require('cookie-parser');

// const port = 3001;

// const productRoute = require('./routes/product');
// const categoryRoute = require('./routes/category');
// const searchRoute = require('./routes/search');
// const userRoute = require('./routes/user');
// const adminRoute = require('./routes/admin');
// const orderRoute = require('./routes/order');

// dotenv.config();
// const app = express();
// app.use(bodyParser.json({ limit: '50mb' }));
// // app.use(cors({ origin: true, credentials: true }));
// app.use(
//     cors({
//         origin: 'https://oragnive-ui.vercel.app',
//         credentials: true,
//         exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
//     }),
// );
// app.use(morgan('common'));
// app.use(cookiparser());

// // Add headers before the routes are defined
// app.use(function (req, res, next) {
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', process.env.REACT_URL);

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

// async function connect() {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL);
//         console.log('connect DB successfully!!!');
//     } catch (error) {
//         console.log('connect DB failure!!!');
//         console.log(error);
//     }
// }
// connect();

// // ROUTES
// app.use('/api/product', productRoute);
// app.use('/api/category', categoryRoute);
// app.use('/api/search', searchRoute);
// app.use('/api/user', userRoute);
// app.use('/api/admin', adminRoute);
// app.use('/api/order', orderRoute);

// app.get('/', (req, res) => {
//     res.send('Server is running....');
// });

// app.listen(port, () => {
//     console.log(`Server is running....`);
// });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const productRoute = require('./routes/product');
const categoryRoute = require('./routes/category');
const searchRoute = require('./routes/search');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const orderRoute = require('./routes/order');

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

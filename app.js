// Core Modules

// Require NPM
/////////////////////
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const hpp = require("hpp");
const cookieParser = require('cookie-parser')

// Require Application
const logger = require("./util/logger");
const errorController = require("./controllers/errorController");
const setupSocket = require('./sockets')

// Require Routers
/////////////////////
const authRouter = require('./routers/authRouter')
const companyRouter = require('./routers/companyRouter')
// const chatRouter = require('./routers/chatRouter')
const userRouter = require('./routers/userRouter')
const msgRouter = require('./routers/msgRouter')

// App
/////////////////////

// Express
const app = express();

// SocketIO
/////////////////////
const httpServer = createServer(app);

// Define allowed origins
let allowedOrigins = [
    'http://localhost:3008'
];

if(process.env.SOCKETIO_CROS_ORIGINS){
    allowedOrigins = process.env.SOCKETIO_CROS_ORIGINS.split(',')
}

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST']
    }
});

// Run Socket logic
setupSocket(io)

// To make `io` accessible from Express => const io = req.app.get('socketio');
app.set('socketio', io);

//Security MiddleWares
/////////////////////
app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
    })
);
app.set("trust proxy", 1); //for iis proxy to get correct ip
app.use(
    rateLimit({
        max: 100, //100 requests per min
        windowMs: 1000 * 60,
        message:
            "More then 100 requests in one min from this IP, please try again later",
    })
);
app.use(xss());
app.use(hpp());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
let expressCorsOrigins = ['http://localhost:3008']
if (process.env.EXPRESS_CROS_ORIGINS) {
    expressCorsOrigins = process.env.EXPRESS_CROS_ORIGINS.split(',')
}
app.use(cors({ credentials: true, origin: expressCorsOrigins }))

app.use((req, _, next) => {
    logger
        .writeLog("app")
        .info(
            `${__filename}: middleWare/getRequestStatus :: IP=${req.headers["x-forwarded-for"] || req.socket.remoteAddress
            } Path=${req.originalUrl}`
        );
    next();
});

// Use Routers
/////////////////////

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/companies', companyRouter)
// app.use('/api/v1/chats', chatRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/msgs', msgRouter)
// Error Controller
/////////////////////
app.use(errorController);


// Default Router
app.all('*', async (req, res, next) => {
    logger.writeLog("app").info(`all(*) ::`);
    logger.writeLog("app").info(`all(*) :: body=${JSON.stringify(req.body)}`);
    logger.writeLog("app").info(`all(*) :: query=${JSON.stringify(req.query)}`);
    logger.writeLog("app").info(`all(*) :: params=${JSON.stringify(req.params)}`);
    logger.writeLog("app").info(`all(*) :: headers=${JSON.stringify(req.headers)}`);
    res.send()
})

module.exports = { app, httpServer };


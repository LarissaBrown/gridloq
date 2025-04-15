const ex = require('express');
const path = require('path');
const { apiRouter } = require('./routes/api');
const { enableCors, validateAuthToken } = require('./middleware/auth');
const { staticSiteRouter } = require('./routes/static');
const { errorHandler, logger } = require('./middleware/log');
const { createServer } = require('http');
const gameRouter = require('./routes/gameRouter');
const gameRateLimiter = require('./middleware/rateLimiter');

const app = ex();
const server = createServer(app);

app.use(logger);
app.use(enableCors);
app.use(ex.json());
app.use(ex.urlencoded({ extended: true }));

// Fix the router usage order and syntax
app.use('/api/game', gameRateLimiter, gameRouter);
app.use('/api', validateAuthToken, apiRouter);
app.get('*', staticSiteRouter);

app.use(errorHandler);

module.exports = {
    server
};

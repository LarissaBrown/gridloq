const { server } = require("./server");
const mg = require('mongoose');
const { io } = require('./services/sockets');

server.listen(process.env.PORT || 8080, () => {
    console.log('server listening on port ' + process.env.PORT);
});
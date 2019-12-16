console.log('Process node version', process.version);

const express = require('express');
const app = express();

const movieAPIRouter = require('./routes/movie');
const fpTestAPIRouter = require('./routes/fpTest');
const kjGlassApiRouter = require('./routes/kjGlass');

app.use('/api/movie', movieAPIRouter);
app.use('/api/fptest', fpTestAPIRouter);
app.use('/api/kjglass', kjGlassApiRouter);

app.use('/', function (req, res) {
    res.send('Bobby Kim, Tei Eom Playground server.');
});

app.listen(8080, () => {
    console.log('server is running on http://localhost:8080');
});

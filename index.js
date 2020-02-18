import { GraphQLServer } from 'graphql-yoga';
import resolvers from './graphql/resolvers';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const graphQLServer = new GraphQLServer({
    typeDefs: 'graphql/scheme.graphql',
    resolvers
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

console.log('Process node version', process.version);

const movieAPIRouter = require('./routes/movie');
const fpTestAPIRouter = require('./routes/fpTest');
const kjGlassApiRouter = require('./routes/kjGlass');
const lkLabApiRouter = require('./routes/lkLab');
const subTitlesApiRouter = require('./routes/subtitles');

app.use('/api/movie', movieAPIRouter);
app.use('/api/fptest', fpTestAPIRouter);
app.use('/api/kjglass', kjGlassApiRouter);
app.use('/api/lklab', lkLabApiRouter);
app.use('/api/gcs', subTitlesApiRouter);

app.use('/', function (req, res) {
    res.send('Bobby Kim, Tei Eom Playground server.');
});

app.listen(8080, () => {
    console.log('Express server is running on http://localhost:8080');
});

graphQLServer.start(() => {
    console.log('GraphQL server is running on http://localhost:4000');
});

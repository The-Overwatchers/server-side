'use strict'


const express = require('express');
const cors = require('cors');
const pg = require('pg');
const app = express();
const PORT = process.env.PORT;
const conString = process.env.DATABASE_URL;
const client = new pg.Client(conString);
const igdb = require('igdb-api-node').default;
const igdbClient = igdb('1b6d98357aa029cadab62da1bf4c7061');

client.connect();
client.on('error', err => {
  console.error(err);
});
app.use(cors());



igdbClient.games({
    fields: '*', // Return all fields
    limit: 5, // Limit to 5 results
    offset: 15 // Index offset for results
  }).then(response => {
    console.log(response);
  }).catch(error => {
    throw error;
});


// Maxs key: 1b6d98357aa029cadab62da1bf4c7061
app.get('*', (req, res) => {
  res.status(404).send('File Not Found!');
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
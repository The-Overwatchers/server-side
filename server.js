'use strict'


const express = require('express');
const cors = require('cors');
const pg = require('pg');
const app = express();
const PORT = process.env.PORT;
const conString = process.env.DATABASE_URL;
const client = new pg.Client(conString);
const igdb = require('igdb-api-node').default;
const igdbClient = igdb(process.env.IGDB_API_KEY);

client.connect();
client.on('error', err => {
  console.error(err);
});
app.use(cors());




app.get('/api/v1/games/:name', (request, response) => {
  console.log('The search function is hitting')
  igdbClient.games({
    fields: '*', // Return all fields
    limit: 25, // Limit to 5 results
    search: `${request.params.name}`
  }, [
      'name'
  ]).then(result => {
      return response.send(result.body)})
    .catch(error => {
      throw error;
  });
  
})

app.get('/api/v1/game-description/:id', (request, response) => {
  console.log(request.params.id);
  igdbClient.games({
    ids: [
        request.params.id
    ]
}, [
    'name',
    'cover',
    'summary',
    'genres',
    'publishers',
    'platforms'
]).then(result => {
      return response.send(result.body)})
    .catch(error => {
      throw error;
  });
  
})


app.get('*', (req, res) => {
  res.status(404).send('File Not Found!');
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
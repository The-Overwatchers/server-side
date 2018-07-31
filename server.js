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
    limit: 3, // Limit to 5 results
    search: `${request.params.name}`
  }, [
      'name'
  ]).then(result => {
      return response.send(result.body)})
    .catch(error => {
      console.error(error);
  });
  
})

app.get('/api/v1/game-description/:id', (request, response) => {
    console.log(request.params.id);
    // MAX -- make an object to hold all game info, then append the various things that need to be requested (platforms, genres, etc.) from their respective igdb databases
    let gameInfo = {};
    igdbClient.games({
      ids: [
          request.params.id
      ]
  }, [
      'name',
      'cover',
      'summary',
      'genres',
      'themes',
      'publishers',
      'platforms'
  ])
    .then(result => {
        console.log(result.body[0].publishers)
        igdbClient.companies({
          ids: result.body[0].publishers
      }, [
          'name'
      ])
        .then(publisherNames => {
          console.log(publisherNames)
          result.body[0].publishers = []
          publisherNames.body.forEach((element, index) => {
            result.body[0].publishers.push(publisherNames.body[index].name)
          })
          console.log(result.body[0].publishers)
        return response.send(result.body)})
      .catch(error => {
      console.error(error);
  });
  })
})




app.get('*', (req, res) => {
  res.status(404).send('File Not Found!');
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
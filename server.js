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
          result.body[0].publishersDisplay = []
          publisherNames.body.forEach((element, index) => {
            result.body[0].publishersDisplay.push(publisherNames.body[index].name)
          })
          console.log(result.body[0].publishers)
          
        return response.send(result.body)})})
      .catch(error => {
      console.error(error);
  });
  })

// User Registration
app.get('/api/v1/user/register/:name', (request, response) => {
  console.log(request.params);
  let SQL = 'SELECT * FROM users WHERE username=$1';
  let values = [request.params.name];

  client.query(SQL, values)
    .then(results => {
      console.log(results.rowCount);
      if(!results.rowCount) {
        let SQL = 'INSERT INTO users (username) VALUES($1)';
        client.query(SQL, values)
          .then(results => { // eslint-disable-line
            console.log(results);
            response.send({
              success: 1,
              string: 'Username created!'
            });
          });
      } else {
        response.send({
          success: 0,
          string: 'Username already taken. Please choose another.'
        });
      }
    })
})

// User Login
app.get('/api/v1/user/login/:name', (request, response) => {
  let SQL = 'SELECT * FROM users WHERE username=$1';
  let values = [request.params.name];

  client.query(SQL, values)
    .then(results => {
      if(!!results.rowCount) {
        response.send({
          success: 1,
          string: `Sucessfully logged in as ${request.params.name}`,
          myName: request.params.name
        });
      } else {
        response.send({
          success: 0,
          string: `The username '${request.params.name}' does not exist. Please register or try again.`
        });
      }
    })
})

//<--------------------------MAX--------------------------------->
// This should be called by a function that pulls all favorited games by a user, 
// runs through the logic to find the most common genres, theme, and platform, 
// stores each of those in an object as arrays, then sends the request.
//<--------------------------MAX--------------------------------->

app.get('/api/v1/favorite', (request, response) => {
  console.log('The favorite function is hitting')
  igdbClient.games({
    fields: '*', // Return all fields
    limit: 5, // Limit to 5 results
    genres: request.body.genre, 
    themes: request.body.themes,
    platforms: request.body.platforms
  }, [
      'name'
  ]).then(result => {
      return response.send(result.body)})
    .catch(error => {
      console.error(error);
  });
})

app.get('*', (req, res) => {
  res.status(404).send('File Not Found!');
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
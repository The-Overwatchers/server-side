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
app.use(express.json())
app.use(express.urlencoded({extended: true}))




app.get('/api/v1/games/:name', (request, response) => {
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
      igdbClient.companies({
        ids: result.body[0].publishers
      }, [
        'name'
      ])
        .then(publisherNames => {
          result.body[0].publishersDisplay = []
          publisherNames.body.forEach((element, index) => {
            result.body[0].publishersDisplay.push(publisherNames.body[index].name)
          })          
          return response.send(result.body)})})
    .catch(error => {
      console.error(error);
    });
})

// User Registration
app.get('/api/v1/user/register/:name', (request, response) => {
  let SQL = 'SELECT * FROM users WHERE username=$1';
  let values = [request.params.name];

  client.query(SQL, values)
    .then(results => {
      if(!results.rowCount) {
        let SQL = 'INSERT INTO users (username) VALUES($1)';
        client.query(SQL, values)
          .then(results => { // eslint-disable-line
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
      console.log(results);
      if(!!results.rowCount) {
        response.send({
          success: 1,
          string: `Sucessfully logged in as ${request.params.name}`,
          myName: request.params.name,
          userId: results.rows[0].id
        });
      } else {
        response.send({
          success: 0,
          string: `The username '${request.params.name}' does not exist. Please register or try again.`
        });
      }
    })
})

// Add Favorite
app.post('/api/v1/favorite', (request, response) => {
  let SQL0 = 'SELECT id FROM games WHERE igdb_id=$1;';
  let values0 = [request.body.igdb_id];

  client.query(SQL0, values0)
    .then(results0 => {
      if(results0.rows[0] === undefined) {
        let SQL1 = 'INSERT INTO games (name, igdb_id) VALUES ($1, $2);'; // putting game name in game database
        let values1 = [request.body.name, request.body.igdb_id];
        client.query(SQL1, values1);
      }
    })

    .then(results1 => {
      let SQL2 = 'SELECT id FROM games WHERE name=$1;';
      let values2 = [request.body.name];

      client.query(SQL2, values2)
        .then(results2 => {
          request.body.gameTableId = results2.rows[0].id;
          let SQL3 = 'SELECT id FROM users WHERE username=$1;';
          let values3 = [request.body.user];

          client.query(SQL3, values3)
            .then(results3 => {
              let SQL4 = 'SELECT * FROM users_games WHERE users_id=$1 AND games_id=$2;';
              let values4 = [results3.rows[0].id, request.body.gameTableId];
              client.query(SQL4, values4)
                .then(results4 => {
                  if(results4.rows[0] === undefined) {
                    let SQL5 = 'INSERT INTO users_games (users_id, games_id) VALUES ($1, $2);';
                    let values5 = [results3.rows[0].id, request.body.gameTableId];
                    client.query(SQL5, values5);
                    return true;
                  } else {
                    return false;
                  }
                })
                .then(results5 => {response.send({
                  success: results5,
                  string: 'Favorite succeeded'
                })})
                .catch(error => {
                  console.error(error);
                });
            })
            .catch(error => {
              console.error(error);
            });
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
});

// Remove Favorite
app.get('/api/v1/favorite/:id', (request, response) => {
  let SQL = `
    SELECT games.igdb_id
    FROM games INNER JOIN users_games ON games.id = users_games.games_id 
    WHERE users_games.users_id=$1;`;
  let values = [request.params.id];

  client.query(SQL, values)
    .then(result1 => {
      console.log(result1); 
      let favoriteIds = [];
      result1.rows.forEach(element => {
        favoriteIds.push(element.igdb_id);
      });
      console.log(favoriteIds);
      igdbClient.games({
        ids: favoriteIds
      }, [ 
        'cover'
      ])
        .then(result3 => {
          console.log(result3);
          response.send(result3.body);
        })
        .catch(error => {
          console.error(error);
        });

    }).catch(error => {
      console.error(error);
    });
});

app.delete('/api/v1/favorite/delete', (request, response) =>{
  let SQL1 = 'SELECT id FROM games WHERE igdb_id=$1';
  let values1 = [request.body.id];

  client.query(SQL1, values1)
    .then(result => {
      let SQL2 = 'DELETE FROM users_games WHERE users_id=$1 AND games_id=$2;';
      let values2 = [request.body.user, result.rows[0].id];

      client.query(SQL2, values2)
        .then(result2 => {
          response.send('successfully deleted');
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });

  response.send('delete function is hitting');
});

//<--------------------------MAX--------------------------------->
// This should be called by a function that pulls all favorited games by a user, 
// runs through the logic to find the most common genres, theme, and platform, 
// stores each of those in an object as arrays, then sends the request.
//<--------------------------MAX--------------------------------->

// app.get('/api/v1/favorite', (request, response) => {
//   console.log('The favorite function is hitting')
//   igdbClient.games({
//     fields: '*', // Return all fields
//     limit: 5, // Limit to 5 results
//     genres: request.body.genre, 
//     themes: request.body.themes,
//     platforms: request.body.platforms
//   }, [
//     'name'
//   ]).then(result => {
//     return response.send(result.body)})
//     .catch(error => {
//       console.error(error);
//     });
// })

app.get('*', (req, res) => {
  res.status(404).send('File Not Found!');
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
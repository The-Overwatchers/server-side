# Setup

## Create an IGDB API key
Create an account on ![this](https://api.igdb.com/signup) website to get an API key. Make sure to keep this key safe!

## Database
To set up the database, install Postgresql and follow the instructions ![here](./DATABASE.md)

## Environment
In a new shell terminal, create the following environmental variables

 (For MAC)
 - DATABASE_URL=postgres://localhost:5432/game_inspector
 (For WINDOWS)
 - DATABASE_URL=postgres://YourUserName:YourPassword@localhost:5432/game_inspector

- PORT=3000
- IGDB_API_KEY=YouAPIKey

## Starting your server
Finally, start your server-side using node.js. Locally host your client-side files to start using the app!

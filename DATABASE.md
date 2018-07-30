# NOTES
Create three tables: (1) users, (2) games, and (3) users_movies. The third table is an association table (a.k.a. junction table) which can be used to store the user's favorite selections. 

# DATABASE
game_inspector

# TABLES
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(50),
  favorites INTEGER
);

CREATE TABLE games(
  id SERIAL PRIMARY KEY,
  game VARCHAR(128),
  genre VARCHAR(64),
  
);

CREATE TABLE users_games(
  id SERIAL PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  games_id INTEGER FOREIGN KEY
);

# INSERT INTO TABLE
INSERT INTO <tablename> 
  VALUES ('<valuelist>')
  ON CONFLICT DO NOTHING;
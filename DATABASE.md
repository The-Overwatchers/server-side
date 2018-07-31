# DATABASE PLANs
Create three tables: (1) users, (2) games, and (3) users_movies. The third table is an association table (a.k.a. junction table) which can be used to store the user's favorite selections. 

# DATABASE
game_inspector

# STANDALONE TABLES
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(50),
);

CREATE TABLE games(
  id SERIAL PRIMARY KEY,
  name VARCHAR(128),
  igdb_id INTEGER,
);

# ASSOCIATIVE TABLES
CREATE TABLE users_games(
  id SERIAL PRIMARY KEY,
  users_id INTEGER,
  games_id INTEGER
);

# INSERT INTO TABLE
INSERT INTO <tablename> 
  VALUES ('<valuelist>')
  ON CONFLICT DO NOTHING;
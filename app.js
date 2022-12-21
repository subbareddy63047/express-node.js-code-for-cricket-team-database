const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error:${error.message}`);
    process.exit(1);
  }
};

initializeAndServer();

//API1

app.get(`/players/`, async (request, response) => {
  const allPlayersData = `
    select * from cricket_team
    order by player_id;`;
  const results = await db.all(allPlayersData);
  const sub = (dbObject) => {
    let array = [];
    for (let each of dbObject) {
      array.push({
        playerId: each.player_id,
        playerName: each.player_name,
        jerseyNumber: each.jersey_number,
        role: each.role,
      });
    }
    return array;
  };

  response.send(sub(results));
});

//API2

app.post(`/players/`, async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  try {
    const Details = `
    INSERT INTO cricket_team(
        player_name,jersey_number,role)
        values(
            '${playerName}',
            ${jerseyNumber},
            '${role}');`;
    const dbResponse = await db.run(Details);
    const playerId = dbResponse.lastID;
    response.send(`Player Added to Team`);
  } catch (error) {
    console.log(`post DB error:${error.message}`);
    console.log(request.body);
  }
});

//API3

app.get(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const player = `
    select * from cricket_team
    where player_id=${playerId};`;
  const results = await db.get(player);

  const single = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(single(results));
});

//API4
app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  try {
    const updatedPlayerDetails = `
    update cricket_team
    set
            player_name= "${playerName}",
            jersey_number= "${jerseyNumber}",
            role= "${role}"
            where player_id= ${playerId};`;
    const results = await db.run(updatedPlayerDetails);
    response.send("Player Details Updated");
  } catch (error) {
    console.log(`put DB error:${error.message}`);
  }
});

//API5

app.delete(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetails = `
    delete from cricket_team
    where player_id= ${playerId};`;
  const results = await db.run(deletePlayerDetails);
  response.send(`Player Removed`);
});
module.exports = app;

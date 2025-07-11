const { google } = require("googleapis");

async function cacheTeams(auth, spreadsheetId) {
  const sheets = google.sheets({ version: "v4", auth });
  const range = "Teams!A3:Z";
  const teamData = {};

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values;

  if (!rows || rows.length === 0) throw new Error("No data found in sheet.");

  rows.forEach((row) => {
    const tag = row[0]?.toUpperCase().trim();
    const name = row[1];
    const description = row[2];
    const players = row.slice(3).filter(Boolean);
    teamData[tag] = { name, description, players };
  });

  return teamData;
}

module.exports = { cacheTeams };

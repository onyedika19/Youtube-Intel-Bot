const { authenticate } = require("./src/auth/googleAuth");
const { cacheTeams } = require("./src/google/sheets");
const { getLiveChatId } = require("./src/google/youtube");
const { readLiveChat } = require("./src/bot/liveChatHandler");
const dotenv = require('dotenv')
dotenv.config()

const CREDENTIALS_PATH = "credentials.json";
const SPREADSHEET_ID = "13nLq11H-_Xq-hkl8ywiCXRs-JHepIv94NMO1xlH09d4";
const VIDEO_ID = "gAaZUR11-kY";

async function main() {
  const auth = await authenticate(CREDENTIALS_PATH);
  const teamData = await cacheTeams(auth, SPREADSHEET_ID);
  const liveChatId = await getLiveChatId(auth, VIDEO_ID);

  if (!liveChatId) return console.error("Live chat not found.");
  readLiveChat(auth, liveChatId, teamData);
}

main();
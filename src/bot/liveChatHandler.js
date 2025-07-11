const { google } = require("googleapis");
const { generateReply } = require("../services/gemini");
const { sendMessage } = require("../google/youtube");

let chats = [];
let nextPageToken = null;

function handleMessage(text, author, teamData, youtube, liveChatId) {
  chats.push(`${author}: ${text}`);

  if (text && text.startsWith("!")) {
    const tag = text.substring(1).toUpperCase().trim();
    const team = teamData[tag];
    if (team) {
      const reply = `${team.name} - ${team.description} with solid roster of ${team.players.join(", ")}`;
      sendMessage(youtube, liveChatId, reply);
    }
  }

  if (text && text.includes("@CHRISxx")) {
    const replies = ["No cap, @CHRISxx built different 😤", "CHRISxx be carrying! 📦", "Yo @CHRISxx, say less 😎"];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    sendMessage(youtube, liveChatId, `@${author} ${randomReply}`);
  }
}

async function readLiveChat(auth, liveChatId, teamData) {
  const youtube = google.youtube({ version: "v3", auth });

  setInterval(async () => {
    try {
      const res = await youtube.liveChatMessages.list({
        liveChatId,
        part: "snippet,authorDetails",
        pageToken: nextPageToken,
      });

      nextPageToken = res.data.nextPageToken;
      const messages = res.data.items;

      messages.forEach((msg) => {
        const author = msg.authorDetails.displayName;
        const text = msg.snippet.displayMessage;
        if (msg.authorDetails.channelId !== "UCaHY4cfMDUhjKMAPxJ4MOcg") {
          handleMessage(text, author, teamData, youtube, liveChatId);
        }
      });

      const aiReply = await generateReply(chats);
      chats = [];
      if (aiReply) sendMessage(youtube, liveChatId, aiReply);
    } catch (err) {
      console.error("Error reading chat:", err);
    }
  }, 20000);
}

module.exports = { readLiveChat };

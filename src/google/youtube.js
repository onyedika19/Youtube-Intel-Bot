const { google } = require("googleapis");

async function getLiveChatId(auth, videoId) {
  const youtube = google.youtube({ version: "v3", auth });

  const res = await youtube.videos.list({
    part: "liveStreamingDetails",
    id: videoId,
  });

  const video = res.data.items[0];
  console.log(video)
  return video?.liveStreamingDetails?.activeLiveChatId || null;
}

async function sendMessage(youtube, liveChatId, messageText) {
  try {
    await youtube.liveChatMessages.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          type: "textMessageEvent",
          liveChatId,
          textMessageDetails: {
            messageText,
          },
        },
      },
    });
    console.log(`[SENT]: ${messageText}`);
  } catch (err) {
    console.error("Failed to send message:", err);
  }
}

module.exports = { getLiveChatId, sendMessage };

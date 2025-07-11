const { authenticate } = require("./src/auth/googleAuth");
const { cacheTeams } = require("./src/google/sheets");
const { getLiveChatId } = require("./src/google/youtube");
const { readLiveChat } = require("./src/bot/liveChatHandler");

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













// const { google } = require("googleapis");
// const fs = require("fs");
// const readline = require("readline");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// let teamData = {};
// const APIKEY = "AIzaSyB2lf6KuvtEROmeVLGhkUVBv4c46YZkyPU";

// // If modifying this, remember to set the appropriate OAuth scopes.
// const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// const TOKEN_PATH = "token.json";
// const genAI = new GoogleGenerativeAI(APIKEY);
// let chats = [];

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });


// async function generateReplyFromGemini() {
//   let tempChats = [];
//   for (let i = 0; i < chats.length; i++) {
//     const data = chats[i].split(":");
//     if (data.length < 2) continue;
//     if (data[1].trim()[0] != "!") tempChats.push(chats[i]);
//   }
//   if (tempChats.length == 0) return null;

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const prompt = `
//   You’re a funny and savage esports livestream bot. Here is the current chat messages:
//   ${tempChats.map((chat) => chat).join("\n")}
  
  
  
  
//   Pick a random user and either roast or support - reply with something witty, savage, or supportive depending on the tone of the message.
//   Make sure it’s short, humorous, and fun. Also if you see pidgin, you could also reply the user in pidgin. Tag the user in the reply (e.g. @user then reply)
//   Return the reply as a single string. Do not quote the user, just send your reply. Avoid using text formatting (e.g. Hey)
//   `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const reply = response.text();
//     console.log(reply, "oko okoko ko");
//     return reply;
//   } catch (err) {
//     console.error("Error generating reply from Gemini:", err);
//     return null;
//   }
// }
// // Authorize the client
// function authorize(credentials, callback) {
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(
//     client_id,
//     client_secret,
//     redirect_uris[0]
//   );

//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getNewToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }

// // Get a new token after user consent
// function getNewToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: SCOPES,
//   });
//   console.log("Authorize this app by visiting this url:", authUrl);
//   rl.question("Enter the code from that page: ", (code) => {
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error("Error retrieving access token:", err);
//       oAuth2Client.setCredentials(token);
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error("Error storing token:", err);
//         console.log("Token stored to", TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }

// // Fetch team data from the sheet
// function listTeams(auth) {
//   const sheets = google.sheets({ version: "v4", auth });

//   // Add your actual spreadsheet ID here
//   const spreadsheetId = "13nLq11H-_Xq-hkl8ywiCXRs-JHepIv94NMO1xlH09d4"; // Replace with your actual spreadsheet ID
//   const range = "Teams!A2:Z"; // Adjust the range based on your sheet's layout

//   sheets.spreadsheets.values.get(
//     {
//       spreadsheetId,
//       range,
//     },
//     (err, res) => {
//       if (err) return console.log("The API returned an error: " + err);
//       const rows = res.data.values;
//       if (rows.length) {
//         rows.forEach((row) => {
//           // Output the team and roster
//           // console.log(`${row[0]}: ${row.slice(1).join(', ')}`);
//           // console.log(rows.length);
//         });
//       } else {
//         console.log("No data found.");
//       }
//     }
//   );
// }

// function cacheTeams(auth) {
//   const sheets = google.sheets({ version: "v4", auth });
//   const spreadsheetId = "13nLq11H-_Xq-hkl8ywiCXRs-JHepIv94NMO1xlH09d4";
//   const range = "Teams!A3:G";

//   return new Promise((resolve, reject) => {
//     sheets.spreadsheets.values.get({ spreadsheetId, range }, (err, res) => {
//       if (err) return reject("API error: " + err);
//       const rows = res.data.values;
//       if (!rows || rows.length === 0) return reject("No data found.");

//       rows.forEach((row) => {
//         const tag = row[0]?.toUpperCase(); // e.g. AE
//         const name = row[1]; // e.g. AFRO ESPORTS
//         const description = row[2]; // e.g. Old takers assoc.
//         const players = row.slice(3).filter((p) => p); // Only non-empty players

//         teamData[tag] = { name, description, players };
//       });

//       resolve();
//     });
//   });
// }

// const videoId = "IHhDRY84fHQ"; // Replace this with the actual stream's video ID

// async function getLiveChatIdFromVideo(auth, videoId) {
//   const youtube = google.youtube({ version: "v3", auth });

//   try {
//     const response = await youtube.videos.list({
//       part: "liveStreamingDetails",
//       id: videoId,
//     });

//     const video = response.data.items[0];
//     if (
//       video &&
//       video.liveStreamingDetails &&
//       video.liveStreamingDetails.activeLiveChatId
//     ) {
//       return video.liveStreamingDetails.activeLiveChatId;
//     } else {
//       console.log("Live chat not found or the stream is not live.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching live chat ID:", error);
//     return null;
//   }
// }

// async function main() {
//   const auth = await authenticate({
//     keyfilePath: "credentials.json",
//     scopes: [
//       "https://www.googleapis.com/auth/youtube.force-ssl",
//       "https://www.googleapis.com/auth/spreadsheets.readonly",
//     ],
//   });

//   await cacheTeams(auth);

//   const liveChatId = await getLiveChatIdFromVideo(auth, videoId);
//   if (!liveChatId) {
//     console.log("Could not get live chat ID.");
//     return;
//   }

//   readLiveChatMessages(auth, liveChatId);
// }
// let nextPageToken = null;

// async function readLiveChatMessages(auth, liveChatId) {
//   const youtube = google.youtube({ version: "v3", auth });

//   console.log("Reading live chat messages...");

//   setInterval(async () => {
//     try {
//       const response = await youtube.liveChatMessages.list({
//         liveChatId,
//         part: "snippet,authorDetails",
//         pageToken: nextPageToken,
//       });

//       nextPageToken = response.data.nextPageToken;
//       const messages = response.data.items;
//       const filteredMessages = messages.filter(
//         (message) =>
//           message.authorDetails.channelId != "UCaHY4cfMDUhjKMAPxJ4MOcg"
//       );
//       filteredMessages.forEach((message) => {
//         const author = message.authorDetails.displayName;
//         const text = message.snippet.displayMessage;

//         console.log(`${author}: ${text}`);
//         chats.push(`${author}: ${text}`);

//         if (text && text.startsWith("!")) {
//           const tag = text.substring(1).trim().toUpperCase();
//           const team = teamData[tag];
//           if (team) {
//             const reply = `${team.name} - ${
//               team.description
//             } with solid roster of ${team.players.join(", ")}`;
//             sendMessageToLiveChat(youtube, liveChatId, reply);
//           }
//         }
//         if (text && text.includes("@CHRISxx")) {
//           const randomIndex = Math.floor(Math.random() * replies.length);
//           sendMessageToLiveChat(
//             youtube,
//             liveChatId,
//             `@${author} ${replies[randomIndex]}`
//           );
//         }
//       });
//       const data = await generateReplyFromGemini();
//       chats = [];
//       if (data) sendMessageToLiveChat(youtube, liveChatId, data);
//     } catch (error) {
//       console.error('Error fetching chat messages:", error');
//     }
//   }, 60000);

//   setInterval(async () => {
//     try {
//       const response = await youtube.liveChatMessages.list({
//         liveChatId,
//         part: "snippet,authorDetails",
//         pageToken: nextPageToken,
//       });

//       nextPageToken = response.data.nextPageToken;
//       const messages = response.data.items;
//       const filteredMessages = messages.filter(
//         (message) =>
//           message.authorDetails.channelId != "UCaHY4cfMDUhjKMAPxJ4MOcg"
//       );
//       filteredMessages.forEach((message) => {
//         const author = message.authorDetails.displayName;
//         const text = message.snippet.displayMessage;

//         chats.push(`${author}: ${text}`);

//         if (text && text.startsWith("!")) {
//           const tag = text.substring(1).trim().toUpperCase();
//           const team = teamData[tag];
//           if (team) {
//             const reply = `${team.name} - ${
//               team.description
//             } with solid roster of ${team.players.join(", ")}`;
//             sendMessageToLiveChat(youtube, liveChatId, reply);
//           }
//         }
//         if (text && text.includes("@CHRISxx")) {
//           const randomIndex = Math.floor(Math.random() * replies.length);
//           sendMessageToLiveChat(
//             youtube,
//             liveChatId,
//             `@${author} ${replies[randomIndex]}`
//           );
//         }
//       });
//     } catch (error) {
//       console.error("Error fetching chat messages:", error);
//     }
//   }, 1600);
// }

// async function sendMessageToLiveChat(youtube, liveChatId, messageText) {
//   try {
//     await youtube.liveChatMessages.insert({
//       part: "snippet",
//       requestBody: {
//         snippet: {
//           type: "textMessageEvent",
//           liveChatId: liveChatId,
//           textMessageDetails: {
//             messageText: messageText,
//           },
//         },
//       },
//     });
//     console.log(`[SENT]: ${messageText}`);
//   } catch (error) {
//     console.error("Error sending message to chat:", error);
//   }
// }

// function authenticate(options) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(options.keyfilePath, (err, content) => {
//       if (err) return reject("Error loading client secret file: " + err);
//       const credentials = JSON.parse(content);
//       const { client_secret, client_id, redirect_uris } = credentials.installed;
//       const oAuth2Client = new google.auth.OAuth2(
//         client_id,
//         client_secret,
//         redirect_uris[0]
//       );

//       fs.readFile(TOKEN_PATH, (err, token) => {
//         if (err) {
//           const authUrl = oAuth2Client.generateAuthUrl({
//             access_type: "offline",
//             scope: options.scopes,
//           });
//           console.log("Authorize this app by visiting this url:", authUrl);
//           rl.question("Enter the code from that page: ", (code) => {
//             rl.close();
//             oAuth2Client.getToken(code, (err, token) => {
//               if (err) return reject("Error retrieving access token: " + err);
//               oAuth2Client.setCredentials(token);
//               fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//                 if (err) return console.error("Error saving token:", err);
//                 console.log("Token stored to", TOKEN_PATH);
//               });
//               resolve(oAuth2Client);
//             });
//           });
//         } else {
//           oAuth2Client.setCredentials(JSON.parse(token));
//           resolve(oAuth2Client);
//         }
//       });
//     });
//   });
// }

// main();


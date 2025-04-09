const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

// If modifying this, remember to set the appropriate OAuth scopes.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Load client secrets
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listTeams);
});

// Authorize the client
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

// Get a new token after user consent
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    rl.question('Enter the code from that page: ', (code) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token:', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error('Error storing token:', err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

// Fetch team data from the sheet
function listTeams(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Add your actual spreadsheet ID here
    const spreadsheetId = '13nLq11H-_Xq-hkl8ywiCXRs-JHepIv94NMO1xlH09d4';  // Replace with your actual spreadsheet ID
    const range = 'Teams!A3:G'; // Adjust the range based on your sheet's layout

    sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            rows.forEach((row) => {
                // Output the team and roster
                // console.log(`${row[0]}: ${row.slice(1).join(', ')}`);
                console.log(rows.length);
            });
        } else {
            console.log('No data found.');
        }
    });
}

const videoId = "K2nfnFk9ZuQ";  // Replace this with the actual stream's video ID

async function getLiveChatIdFromVideo(auth, videoId) {
    const youtube = google.youtube({ version: 'v3', auth });

    try {
        const response = await youtube.videos.list({
            part: 'liveStreamingDetails',
            id: videoId
        });

        const video = response.data.items[0];
        if (video && video.liveStreamingDetails && video.liveStreamingDetails.activeLiveChatId) {
            return video.liveStreamingDetails.activeLiveChatId;
        } else {
            console.log("Live chat not found or the stream is not live.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching live chat ID:", error);
        return null;
    }
}

async function main() {
    const auth = await authenticate({
        keyfilePath: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const liveChatId = await getLiveChatIdFromVideo(auth, videoId);
    if (!liveChatId) {
        console.log("Could not get live chat ID.");
        return;
    }

    readLiveChatMessages(auth, liveChatId);
}

async function readLiveChatMessages(auth, liveChatId) {
    const youtube = google.youtube({ version: "v3", auth });

    console.log("Reading live chat messages...");

    setInterval(async () => {
        try {
            const response = await youtube.liveChatMessages.list({
                liveChatId: liveChatId,
                part: "snippet,authorDetails",
            });

            const messages = response.data.items;
            messages.forEach((message) => {
                const author = message.authorDetails.displayName;
                const text = message.snippet.displayMessage;

                console.log(`${author}: ${text}`);
            });
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    }, 5000);  // Fetch messages every 5 seconds
}

function authenticate(options) {
    return new Promise((resolve, reject) => {
        fs.readFile(options.keyfilePath, (err, content) => {
            if (err) return reject('Error loading client secret file: ' + err);
            const credentials = JSON.parse(content);
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) {
                    const authUrl = oAuth2Client.generateAuthUrl({
                        access_type: 'offline',
                        scope: options.scopes,
                    });
                    console.log('Authorize this app by visiting this url:', authUrl);
                    rl.question('Enter the code from that page: ', (code) => {
                        rl.close();
                        oAuth2Client.getToken(code, (err, token) => {
                            if (err) return reject('Error retrieving access token: ' + err);
                            oAuth2Client.setCredentials(token);
                            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                                if (err) return console.error('Error saving token:', err);
                                console.log('Token stored to', TOKEN_PATH);
                            });
                            resolve(oAuth2Client);
                        });
                    });
                } else {
                    oAuth2Client.setCredentials(JSON.parse(token));
                    resolve(oAuth2Client);
                }
            });
        });
    });
}

main();


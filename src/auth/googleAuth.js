const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];
const TOKEN_PATH = "token.json";

function authenticate(keyfilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(keyfilePath, (err, content) => {
      if (err) return reject("Error loading client secret file: " + err);
      const credentials = JSON.parse(content);
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          const authUrl = oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
          });
          console.log("Authorize this app by visiting this url:", authUrl);
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.question("Enter the code from that page: ", (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
              if (err) return reject("Error retrieving access token: " + err);
              oAuth2Client.setCredentials(token);
              fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error("Error saving token:", err);
                console.log("Token stored to", TOKEN_PATH);
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

module.exports = { authenticate };

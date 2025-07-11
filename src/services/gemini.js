const { GoogleGenerativeAI } = require("@google/generative-ai");
const APIKEY = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(APIKEY);

async function generateReply(chatHistory) {
  const nonCommandChats = chatHistory.filter(
    (msg) => !msg.split(":")[1]?.trim().startsWith("!")
  );
  if (nonCommandChats.length === 0) return null;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You’re a funny and savage esports livestream bot. Here are the chat messages:
${nonCommandChats.join("\n")}

Pick a random user and reply with something witty, savage, or supportive. You can use pidgin if the message has pidgin. Mention the user with @username.
Keep it short, no formatting or quotes.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = { generateReply };

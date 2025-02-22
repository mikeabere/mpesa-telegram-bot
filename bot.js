import * as dotenv from "dotenv";
dotenv.config();
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

import base64 from "base-64";

// Replace with your Telegram Bot Token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Daraja API credentials
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const SHORTCODE = process.env.SHORTCODE;
const PASSKEY = process.env.PASSKEY;
const CALLBACK_URL = process.env.CALLBACK_URL;

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Function to generate access token
async function getAccessToken() {
  const oauthurl =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
    "base64"
  );
  const headers = {
    Authorization: `Basic ${auth}`,
  };
  const response = await axios.get(oauthurl, { headers });
  return response.data.access_token;
}

// Function to initiate STK push
async function initiateSTKPush(phoneNumber, amount) {
  const accessToken = await getAccessToken();
  const stkurl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
  const password = base64.encode(`${SHORTCODE}${PASSKEY}${timestamp}`);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: "254757572696",
    PartyB: SHORTCODE,
    PhoneNumber: "254757572696",
    CallBackURL: CALLBACK_URL,
    AccountReference: "Mpesa Telegram Bot",
    TransactionDesc: "Payment for services",
  };
  const response = await axios.post(stkurl, payload, { headers });
  return response.data;
}

// Telegram bot command handlers
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome! Use /pay <phone_number> <amount> to make a payment."
  );
});

bot.onText(/\/pay (.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const phoneNumber = match[1]; // Extract phone number from the command
  const amount = match[2]; // Extract amount from the command

  try {
    const response = await initiateSTKPush(phoneNumber, amount);
    bot.sendMessage(
      chatId,
      `Payment initiated. Response: ${JSON.stringify(response)}`
    );
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Failed to initiate payment. Please try again.");
  }
});

// Start the bot
console.log("Bot is running...");

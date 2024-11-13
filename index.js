import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits } from 'discord.js';

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Import event handlers
import messageCreateHandler from './events/messageCreate.js';
import interactionCreateHandler from './events/interactionCreate.js';

// Register event handlers
messageCreateHandler(client);
interactionCreateHandler(client);

// Log in to Discord with your bot's token
client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

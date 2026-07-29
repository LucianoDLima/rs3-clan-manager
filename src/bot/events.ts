import { Client } from 'discord.js';
import { handleInteraction } from './interactions/interaction-handler';

export function commandsHandler(client: Client) {
  client.on('interactionCreate', async (interaction) => {
    await handleInteraction(interaction);
  });
}

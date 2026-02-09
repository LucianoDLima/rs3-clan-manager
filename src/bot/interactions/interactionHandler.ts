import { Interaction } from 'discord.js';
import { handleChatInputCommand } from './chatCommands';

export async function handleInteraction(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction);
  }
}

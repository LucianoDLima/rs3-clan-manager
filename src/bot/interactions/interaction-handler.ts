import { Interaction } from 'discord.js';
import { handleChatInputCommand } from './chat-commands';

export async function handleInteraction(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction);
  }
}

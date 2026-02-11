import { ChatInputCommandInteraction } from 'discord.js';
import { handleSetupClan } from '../../services/setupClan';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'setup') {
    await handleSetupClan(interaction);
  }
}

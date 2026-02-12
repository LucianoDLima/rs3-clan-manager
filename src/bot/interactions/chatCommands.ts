import { ChatInputCommandInteraction } from 'discord.js';
import { handleSetupClan } from '../../services/setupClan';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'config') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await handleSetupClan(interaction);
    }
  }
}

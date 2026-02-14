import { ChatInputCommandInteraction } from 'discord.js';
import { handleSetupClan } from '../../services/setupClan';
import { handleSyncMembers } from '../../handlers/handleSyncMembers';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'config') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await handleSetupClan(interaction);
    }

    if (subcommand === 'rename') {
      await interaction.reply('To be implemented');
    }

    if (subcommand === 'sync') {
      await handleSyncMembers(interaction);
    }
  }
}

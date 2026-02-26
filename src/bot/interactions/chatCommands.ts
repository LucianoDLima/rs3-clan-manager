import { ChatInputCommandInteraction } from 'discord.js';
import { handleClanCreation } from '../../handlers/handleClanCreation';
import { handleSync } from '../../handlers/handleSync';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'config') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await handleClanCreation(interaction);
    }

    if (subcommand === 'rename') {
      await interaction.reply('To be implemented');
    }

    if (subcommand === 'sync') {
      await handleSync(interaction);
    }
  }
}

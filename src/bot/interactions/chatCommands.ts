import { ChatInputCommandInteraction } from 'discord.js';
import { handleClanCreation } from '../../handlers/handleClanCreation';
import { handleSync } from '../../handlers/handleSync';
import { handleExceptionList } from '../../handlers/handleExceptionList';
import { handleInactiveList } from '../../handlers/handleInactiveList';
import { handleLeaverList } from '../../handlers/handleLeaverList';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'config') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await handleClanCreation(interaction);
    }

    if (subcommand === 'sync') {
      await handleSync(interaction);
    }
  }

  if (interaction.commandName === 'list') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'exceptions') {
      await handleExceptionList(interaction);
    }

    if (subcommand === 'members') {
    }

    if (subcommand === 'purge') {
      await handleLeaverList(interaction);
    }

    if (subcommand === 'inactive') {
      await handleInactiveList(interaction);
    }

    if (subcommand === 'invalid') {
    }
  }
}

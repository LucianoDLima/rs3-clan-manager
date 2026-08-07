import { ChatInputCommandInteraction } from 'discord.js';
import { handleLeaverList } from '../../features/list-leavers/list-leavers.handler';
import {
  handleAddException,
  handleDeleteException,
  handleListExceptions,
} from '../../features/list-exceptions/list-exceptions.handler';
import { handleClanCreation } from '../../features/clan-setup/clan-setup.handler';
import { handleSync } from '../../features/clan-sync/clan-sync.handler';
import { handleInactiveList } from '../../features/list-inactives/list-inactives.handler';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'clan') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await handleClanCreation(interaction);
    }
  }

  if (interaction.commandName === 'sync') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'exp') {
      await handleSync(interaction);
    }

    if (subcommand === 'activity') {
      // handleSyncByActivity(interaction); TODO
    }
  }

  if (interaction.commandName === 'list') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'exceptions') {
      await handleListExceptions(interaction);
    }

    if (subcommand === 'members') {
    }

    if (subcommand === 'leavers') {
      await handleLeaverList(interaction);
    }

    if (subcommand === 'inactive') {
      await handleInactiveList(interaction);
    }

    if (subcommand === 'invalid') {
    }
  }

  if (interaction.commandName === 'exception') {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      await handleAddException(interaction);
    }

    if (subcommand === 'delete') {
      await handleDeleteException(interaction);
    }
  }
}

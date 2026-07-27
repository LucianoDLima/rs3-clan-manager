import { ChatInputCommandInteraction } from 'discord.js';
import { handleLeaverList } from '../../handlers/handleLeaverList';
import {
  handleAddException,
  handleDeleteException,
  handleListExceptions,
} from '../../features/exception/exception.handler';
import { handleClanCreation } from '../../features/clan/clan.handler';
import { handleSync } from '../../features/members/memberSync.handler';
import { handleInactiveList } from '../../features/members/inactives/inactives.handler';

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
      await handleListExceptions(interaction);
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

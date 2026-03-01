import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';

export const commandList = [
  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Manage your clan configuration')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Create a new clan for this server.')
        .addStringOption((option) =>
          option
            .setName('clanname')
            .setDescription(
              'Add the name of your clan. It must be an exact match to pull data from runemetrics.',
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('sync')
        .setDescription(
          'Sync clan members with runemetrics. This does not remove members.',
        ),
    ),
  new SlashCommandBuilder()
    .setName('list')
    .setDescription('List some of your clan data')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('exceptions')
        .setDescription('Members on the exception list who are not to be kicked.'),
    ),
];

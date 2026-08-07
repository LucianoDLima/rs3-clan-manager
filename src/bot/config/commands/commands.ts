import { SlashCommandBuilder } from 'discord.js';

export const commandList = [
  new SlashCommandBuilder()
    .setName('clan')
    .setDescription('Manage your clan configuration')
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
    ),
  new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Sync your clan members data with the runemetrics hiscores.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('exp')
        .setDescription('Sync members through experience gained.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('activity')
        .setDescription('Sync members through last activity on hiscores.'),
    ),
  new SlashCommandBuilder()
    .setName('list')
    .setDescription('List some of your clan data')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('exceptions')
        .setDescription('Members on the exception list who are not to be kicked.'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('members').setDescription('All current clan members.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('leavers')
        .setDescription('Members who are no longer in the clan or name changed.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('inactive')
        .setDescription('Members who have not been online for x days.')
        .addIntegerOption((option) =>
          option
            .setName('daysinactive')
            .setDescription('Number of days a member has been inactive.')
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('invalid')
        .setDescription('List members the bot could not find last time online.'),
    ),
  new SlashCommandBuilder()
    .setName('exception')
    .setDescription('Manage the clan exception list')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a member to the exception list')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('The in-game name of the member.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Remove a member from the exception list')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('The in-game name of the member.')
            .setRequired(true),
        ),
    ),
];

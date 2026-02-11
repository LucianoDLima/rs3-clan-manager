import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';

export const commandList = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Sets up the clan for this server.')
    .addStringOption((option) =>
      option
        .setName('clanname')
        .setDescription('The name of your clan.')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
];

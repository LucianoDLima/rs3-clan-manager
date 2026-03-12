import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import { findClan } from '../database/clan/findClan';
import { embedCons } from '../bot/embeds/_util';

export async function verifyAdminPermissions(
  interaction: ChatInputCommandInteraction,
) {
  const isAdmin = interaction.memberPermissions?.has(
    PermissionsBitField.Flags.Administrator,
  );

  if (!isAdmin) {
    const adminMsg = 'You must be an administrator to run this command.';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: adminMsg,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: adminMsg,
        flags: MessageFlags.Ephemeral,
      });
    }

    return false;
  }

  return true;
}

export async function verifyClanExist(interaction: ChatInputCommandInteraction) {
  const clan = await findClan(interaction.guildId);

  if (!clan) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('No clan configured yet')
          .setDescription(
            `Make sure an admin runs the \`/config create\` command to create a clan for this server!`,
          )
          .setColor(embedCons.color.INFO),
      ],
    });

    return null;
  }

  return clan;
}

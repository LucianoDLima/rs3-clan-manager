import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { findClan } from './clan-validation.repository';
import { embedCons } from '../embeds/colors';

export async function verifyClanExist(interaction: ChatInputCommandInteraction) {
  const clan = await findClan(interaction.guildId!);

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

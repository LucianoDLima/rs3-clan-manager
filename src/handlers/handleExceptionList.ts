import { ChatInputCommandInteraction } from 'discord.js';
import { findExceptionMembers } from '../database/member/findMember';
import { findClan } from '../database/clan/findClan';
import { embedNoClanConfig } from '../bot/embeds/generalEmbeds';
import { listExceptions } from '../services/listExceptions';

export async function handleExceptionList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    // TODO: Move to middleware too ill do it surely wont postpone every single commit
    const clan = await findClan(interaction.guildId);
    if (!clan) {
      const { noClanConfig } = embedNoClanConfig();
      await interaction.editReply({
        embeds: [noClanConfig],
      });

      return;
    }

    const exceptions = await findExceptionMembers(clan.id);
    const embed = listExceptions(exceptions);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      'Failed to fetch exceptions. TODO: Add better error handling here.',
    );
  }
}

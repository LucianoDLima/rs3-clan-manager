import { ChatInputCommandInteraction } from 'discord.js';
import { findExceptionMembers } from '../database/member/findMember';
import { findClan } from '../database/clan/findClan';
import { embedNoClanConfig } from '../bot/embeds/generalEmbeds';
import { listExceptions } from '../services/listExceptions';
import { generatePaginationButtons, handlePagination } from '../util/pagination';

export async function handleExceptionList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    // TODO: MOVE TO middlware
    const clan = await findClan(interaction.guildId!);
    if (!clan) {
      const { noClanConfig } = embedNoClanConfig();
      await interaction.editReply({ embeds: [noClanConfig] });
      return;
    }

    const exceptionsData = await findExceptionMembers(clan.id);
    const totalPages = Math.ceil(exceptionsData.length / 25) || 1;
    const currentPage = 0;

    const embedList = await interaction.editReply({
      embeds: [listExceptions(exceptionsData, currentPage)],
      components:
        totalPages > 1 ? [generatePaginationButtons(currentPage, totalPages)] : [],
    });

    if (totalPages > 1) {
      handlePagination(
        interaction,
        embedList,
        exceptionsData,
        totalPages,
        listExceptions,
      );
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to fetch exceptions.');
  }
}

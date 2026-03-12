import { ChatInputCommandInteraction } from 'discord.js';
import { findExceptionMembers } from '../database/member/findMember';
import { listExceptions } from '../services/listExceptions';
import { generatePaginationButtons, handlePagination } from '../util/pagination';
import { verifyClanExist } from '../middleware/guard';

/**
 * Handle the rendering of the exception list in discord
 */
export async function handleExceptionList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

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

import { ChatInputCommandInteraction } from 'discord.js';
import { findLeavers } from '../database/member/findMember';
import { generatePaginationButtons, handlePagination } from '../util/pagination';
import { verifyClanExist } from '../middleware/guard';
import { listLeavers } from '../services/listLeavers';

/**
 * Handle the rendering of the members marked as Inactive list in discord
 */
export async function handleLeaverList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const leaversData = await findLeavers(clan.id);
    const totalPages = Math.ceil(leaversData.length / 25) || 1;
    const currentPage = 0;

    const embedList = await interaction.editReply({
      embeds: [listLeavers(leaversData, currentPage)],
      components:
        totalPages > 1 ? [generatePaginationButtons(currentPage, totalPages)] : [],
    });

    if (totalPages > 1) {
      handlePagination(interaction, embedList, leaversData, totalPages, listLeavers);
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to fetch exceptions.');
  }
}

import { ChatInputCommandInteraction } from 'discord.js';
import { findInactiveMembers } from '../database/member/findMember';
import { generatePaginationButtons, handlePagination } from '../util/pagination';
import { verifyClanExist } from '../middleware/guard';
import { listInactives } from '../services/listInactives';

/**
 * Handle the rendering of the inactive list in discord
 */
export async function handleInactiveList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const daysInactive = interaction.options.getInteger('daysinactive');

    const inactivesData = await findInactiveMembers(clan.id, daysInactive);
    const totalPages = Math.ceil(inactivesData.length / 25) || 1;
    const currentPage = 0;

    const embedList = await interaction.editReply({
      embeds: [listInactives(inactivesData, currentPage)],
      components:
        totalPages > 1 ? [generatePaginationButtons(currentPage, totalPages)] : [],
    });

    if (totalPages > 1) {
      handlePagination(
        interaction,
        embedList,
        inactivesData,
        totalPages,
        listInactives,
      );
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to fetch inactive members.');
  }
}

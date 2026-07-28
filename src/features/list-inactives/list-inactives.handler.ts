import { ChatInputCommandInteraction } from 'discord.js';
import { verifyClanExist } from '../../middleware/guard';
import { listInactives } from './list-inactives.service';
import { generatePaginationButtons, handlePagination } from '../../util/pagination';
import { inactiveListEmbed } from './list-inactives.embed';

/**
 * Handle the rendering of the inactive list in discord
 */
export async function handleInactiveList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const daysInactive = interaction.options.getInteger('daysinactive');

    const inactivesData = await listInactives(clan.id, daysInactive || 30);
    const totalPages = Math.ceil(inactivesData.length / 25) || 1;
    const currentPage = 0;

    const embedList = await interaction.editReply({
      embeds: [inactiveListEmbed(inactivesData, currentPage)],
      components:
        totalPages > 1 ? [generatePaginationButtons(currentPage, totalPages)] : [],
    });

    if (totalPages > 1) {
      handlePagination(
        interaction,
        embedList,
        inactivesData,
        totalPages,
        inactiveListEmbed,
      );
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to fetch inactive members.');
  }
}

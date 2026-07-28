import { ChatInputCommandInteraction } from 'discord.js';
import {
  generatePaginationButtons,
  handlePagination,
} from '../../shared/embeds/pagination';
import { verifyClanExist } from '../../shared/command-checks/clan-validation';
import { leaversListEmbed } from './list-leavers.embed';
import { listLeavers } from './list-leavers.service';

/**
 * Handle the rendering of the members marked as Inactive list in discord
 */
export async function handleLeaverList(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const leaversData = await listLeavers(clan.id);
    const totalPages = Math.ceil(leaversData.length / 25) || 1;
    const currentPage = 0;

    const embedList = await interaction.editReply({
      embeds: [leaversListEmbed(leaversData, currentPage)],
      components:
        totalPages > 1 ? [generatePaginationButtons(currentPage, totalPages)] : [],
    });

    if (totalPages > 1) {
      handlePagination(
        interaction,
        embedList,
        leaversData,
        totalPages,
        leaversListEmbed,
      );
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to fetch exceptions.');
  }
}

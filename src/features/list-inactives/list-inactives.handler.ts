import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';
import { verifyClanExist } from '../../shared/command-checks/clan-validation';
import { buildInactiveListText, listInactives } from './list-inactives.service';
import {
  generatePaginationButtons,
  handlePagination,
} from '../../shared/embeds/pagination';
import { inactiveListEmbed } from './list-inactives.embed';
import { errorRunningCommandEmbed } from '../../shared/embeds/general-message';

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

    const fileContent = buildInactiveListText(inactivesData);

    const file = new AttachmentBuilder(Buffer.from(fileContent, 'utf-8'), {
      name: 'inactive_members.txt',
    });

    await interaction.followUp({
      content: `Members inactive for ${daysInactive || 30} days or more:`,
      files: [file],
      ephemeral: true,
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

    await interaction.editReply({
      embeds: [errorRunningCommandEmbed('/list inactives')],
    });
  }
}

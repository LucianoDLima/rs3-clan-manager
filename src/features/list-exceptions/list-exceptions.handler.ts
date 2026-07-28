import { ChatInputCommandInteraction } from 'discord.js';
import { verifyClanExist } from '../../middleware/guard';
import { addException, deleteException, listExceptions } from './list-exceptions.service';
import {
  exceptionAddedEmbed,
  exceptionRemovedEmbed,
  activeMemberNotFoundEmbed,
  exceptionMemberNotFoundEmbed,
  exceptionListEmbed,
} from './list-exceptions.embed';
import { generatePaginationButtons, handlePagination } from '../../util/pagination';

// TODO:
// 1 - Better explain what error was thrown when the command fails. Since error will most likely be the same for all, probably just a generic error message

// Handle the Discord command to add a member to the clan's exception list
export async function handleAddException(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const memberName = interaction.options.getString('name', true);
    const exceptionMember = await addException(clan.id, memberName);

    if (!exceptionMember) {
      await interaction.editReply({
        embeds: [activeMemberNotFoundEmbed(memberName)],
      });

      return;
    }

    await interaction.editReply({
      embeds: [exceptionAddedEmbed(exceptionMember.name)],
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply('An error occurred while adding the exception.');
  }
}

// Handle the Discord command to remove a member from the clan's exception list
export async function handleDeleteException(
  interaction: ChatInputCommandInteraction,
) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const memberName = interaction.options.getString('name', true);
    const exceptionMember = await deleteException(clan.id, memberName);

    if (!exceptionMember) {
      await interaction.editReply({
        embeds: [exceptionMemberNotFoundEmbed(memberName)],
      });

      return;
    }

    await interaction.editReply({
      embeds: [exceptionRemovedEmbed(exceptionMember.name)],
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply('An error occurred while removing the exception.');
  }
}

// Handle the Discord command to list all members in the clan's exception list
export async function handleListExceptions(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const exceptionsData = await listExceptions(clan.id);
    const totalPages = Math.ceil(exceptionsData.length / 25) || 1;
    const currentPage = 0;

    const embedList = await interaction.editReply({
      embeds: [exceptionListEmbed(exceptionsData, currentPage)],
      components:
        totalPages > 1 ? [generatePaginationButtons(currentPage, totalPages)] : [],
    });

    if (totalPages > 1) {
      handlePagination(
        interaction,
        embedList,
        exceptionsData,
        totalPages,
        exceptionListEmbed,
      );
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to fetch exceptions.');
  }
}

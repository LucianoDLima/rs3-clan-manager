import { ChatInputCommandInteraction } from 'discord.js';
import { verifyClanExist } from '../../middleware/guard';
import { addException } from './exception.service';
import { exceptionAddedEmbed, memberNotFoundEmbed } from './exception.embeds';

// Handle the Discord command to add a member to the clan's exception list.
// TODO: 
// 1 - Better explain what error was thrown when the command fails
export async function handleAddException(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const memberName = interaction.options.getString('name', true);
    const exceptionMember = await addException(clan.id, memberName);

    if (!exceptionMember) {
      await interaction.editReply({
        embeds: [memberNotFoundEmbed(memberName)],
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

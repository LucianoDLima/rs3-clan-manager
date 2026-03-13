import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { verifyClanExist } from '../middleware/guard';
import { addException } from '../services/addException';
import { embedCons } from '../bot/embeds/_util';

export async function handleAddException(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  
  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    const memberName = interaction.options.getString('name', true);
    const exceptionMember = await addException(clan.id, memberName);

    if (!exceptionMember) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Member Not Found')
            .setDescription(`Could not find an active member named **${memberName}** in the clan.`)
            .setColor(embedCons.color.INFO),
        ],
      });

      return;
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Exception Added')
          .setDescription(`**${exceptionMember.name}**added to the exception list.`)
          .setColor(embedCons.color.INFO),
      ],
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply('An error occurred while adding the exception.');
  }
}
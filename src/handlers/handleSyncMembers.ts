import { ChatInputCommandInteraction } from 'discord.js';
import { findClan } from '../database/clan/findClan';
import { addMembers } from '../services/populate';

export async function handleSyncMembers(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await findClan(interaction.guildId);
    if (!clan) {
      return interaction.editReply(
        'This server has no clan configured. Use `/config create` first.',
      );
    }

    addMembers(clan, interaction);
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to sync members.');
  }
}

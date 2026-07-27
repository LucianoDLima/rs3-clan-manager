import { ChatInputCommandInteraction } from 'discord.js';
import { setupNewClan } from './clan.service';
import {
  clanIsConfiguredEmbed,
  clanNotFoundEmbed,
  clanSetupErrorEmbed,
  clanSetupSuccessEmbed,
} from './clan.embed';

/**
 * Handle the clan creation process
 * - Validate if the clan is already configured for the guild (which is how the api is called for a discord server id)
 * - Validate if the clan exists in the runemetrics hiscores
 */
export async function handleClanCreation(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  const clanName = interaction.options.getString('clanname', true);

  try {
    const setupRes = await setupNewClan(guildId, clanName);

    if (!setupRes.success && setupRes.existingClan) {
      await interaction.editReply({
        embeds: [clanIsConfiguredEmbed(setupRes.existingClan.name)],
      });
    }

    if (setupRes.clan) {
      await interaction.editReply({
        embeds: [clanSetupSuccessEmbed(setupRes.clan.name)],
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'CLAN_NOT_FOUND') {
      console.error('Clan not found error:', error);

      await interaction.editReply({
        embeds: [clanNotFoundEmbed(clanName)],
      });

      return;
    }

    console.error('Clan creation error:', error);

    await interaction.editReply({
      embeds: [clanSetupErrorEmbed()],
    });
  }
}

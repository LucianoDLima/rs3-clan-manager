import { ChatInputCommandInteraction } from 'discord.js';
import { setupNewClan } from '../services/setupClan';
import {
  embedClanAlreadyConfigured,
  embedClanSetupError,
  embedClanSetupSuccess,
  embedNoClanFound,
} from '../bot/embeds/setupEmbeds';
import { Clan } from '@prisma/client';

export async function handleClanCreation(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  const clanName = interaction.options.getString('clanname', true);

  try {
    const result = await setupNewClan(guildId, clanName);

    if (!result.success && result.isConfigured) {
      const { infoMessage } = embedClanAlreadyConfigured(result.isConfigured);
      await interaction.editReply({
        embeds: [infoMessage],
      });
    }

    if (result.clan) {
      const { successMessage } = embedClanSetupSuccess(result.clan);
      await interaction.editReply({
        embeds: [successMessage],
      });
    }
  } catch (error) {
    if (error.message === 'CLAN_NOT_FOUND') {
      const { noClanFound } = embedNoClanFound({ name: clanName } as Clan);
      return interaction.editReply({
        embeds: [noClanFound],
      });
    }

    console.error('Clan creation error:', error);
    const { errorMessage } = embedClanSetupError();
    await interaction.editReply({
      embeds: [errorMessage],
    });
  }
}

import { ChatInputCommandInteraction } from 'discord.js';
import { verifyAdminPermissions } from '../middleware/guard';
import { createClan } from '../database/clan/createClan';
import { findClan } from '../database/clan/findClan';
import {
  embedClanAlreadyConfigured,
  embedClanSetupError,
  embedClanSetupSuccess,
} from '../bot/embeds/setupEmbeds';

/**
 * - Check if user has admin perms (might not be needed if I set the command to only be usable by admins anyways)
 * - Check if server already hsa a clan configured
 * - Check if the clan exists in the runemetrics
 * - Create the clan
 */
export async function handleSetupClan(interaction: ChatInputCommandInteraction) {
  const isAdmin = await verifyAdminPermissions(interaction);
  if (!isAdmin) return;

  await interaction.deferReply();

  const guildId = interaction.guildId;
  const clanName = interaction.options.getString('clanname', true);

  try {
    const isClanAlreadyConfigured = await findClan(guildId);
    if (isClanAlreadyConfigured) {
      const { infoMessage } = embedClanAlreadyConfigured(isClanAlreadyConfigured);
      await interaction.editReply({
        embeds: [infoMessage],
      });

      return;
    }

    const isClanReal = await validateClanExists(clanName);
    if (!isClanReal) {
      return interaction.editReply({
        content: `The clan **${clanName}** was not found. Please make sure you input a valid clan name.`,
      });
    }

    const clan = await handleClanCreation(interaction, guildId);

    const { successMessage } = embedClanSetupSuccess(clan);
    await interaction.editReply({
      embeds: [successMessage],
    });
  } catch (error) {
    console.error('Error during clan setup:', error);

    const { errorMessage } = embedClanSetupError();
    await interaction.editReply({
      embeds: [errorMessage],
    });
  }
}

// When a clan doesnt exist, it doesnt return an error, just a redirect to the ranking page. This function validades if the clans exists based on that
async function validateClanExists(clanName: string) {
  const url = `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(clanName)}`;

  const response = await fetch(url);

  const isRedirected = !response.url.includes('members_lite.ws');
  if (isRedirected) return false;

  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const text = decoder.decode(buffer);

  const lines = text.trim().split('\n');
  return lines.length > 1;
}

function handleClanCreation(
  interaction: ChatInputCommandInteraction,
  guildId: string,
) {
  const clanName = interaction.options.getString('clanname', true);

  return createClan(guildId, clanName);
}

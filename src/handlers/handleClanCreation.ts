import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { setupNewClan } from '../services/setupClan';
import { Clan } from '@prisma/client';
import { embedCons } from '../bot/embeds/_util';

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

    if (!setupRes.success && setupRes.isConfigured) {
      const msgIsConfigured = embedClanAlreadyConfigured(setupRes.isConfigured);

      await interaction.editReply({
        embeds: [msgIsConfigured],
      });
    }

    if (setupRes.clan) {
      const msgSuccess = embedClanSetupSuccess(setupRes.clan);

      await interaction.editReply({
        embeds: [msgSuccess],
      });
    }
  } catch (error) {
    if (error.message === 'CLAN_NOT_FOUND') {
      const msgNoClanFound = embedNoClanFound({ name: clanName } as Clan);

      return interaction.editReply({
        embeds: [msgNoClanFound],
      });
    }

    console.error('Clan creation error:', error);

    const  msgError  = embedClanSetupError();

    await interaction.editReply({
      embeds: [msgError],
    });
  }
}

function embedClanAlreadyConfigured(clan: Clan) {
  const description = [
    `This server is already set up with the clan: **${clan.name}**.`,
    'If the clan name is incorrect, it will not be able to pull data from the runemetrics.',
  ];

  const embed = new EmbedBuilder()
    .setTitle('Clan has already been configured')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.INFO);

  return embed;
}

function embedClanSetupSuccess(clan: Clan) {
  const description = [`Clan **${clan.name}** has been successfully created!`];

  const embed = new EmbedBuilder()
    .setTitle('Clan created!')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.SUCCESS);

  return embed;
}

function embedNoClanFound(clan: Clan) {
  const description = [
    `The clan **${clan.name}** was not found.`,
    'Please make sure the clan name is correct and try again.',
  ];

  const embed = new EmbedBuilder()
    .setTitle('No clan found')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.INFO);

  return embed;
}

function embedClanSetupError() {
  const description = [
    'Something went wrong while setting up the clan. Please report this error to the developer and include the timestamp shown below.',
  ];

  const embed = new EmbedBuilder()
    .setTitle('Error setting up clan')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.ERROR)
    .setTimestamp(new Date());

  return  embed ;
}

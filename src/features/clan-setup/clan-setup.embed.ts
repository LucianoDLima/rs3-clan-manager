import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../../shared/embeds/colors';

export function clanIsConfiguredEmbed(clanName: string) {
  const description = [
    `This server is already set up with the clan: **${clanName}**.`,
    'If the clan name is incorrect, it will not be able to pull data from the runemetrics.',
  ];

  const embed = new EmbedBuilder()
    .setTitle('Clan has already been configured')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.INFO);

  return embed;
}

export function clanSetupSuccessEmbed(clanName: string) {
  const description = [`Clan **${clanName}** has been successfully created!`];

  const embed = new EmbedBuilder()
    .setTitle('Clan created!')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.SUCCESS);

  return embed;
}

export function clanNotFoundEmbed(clanName: string) {
  const description = [
    `The clan **${clanName}** was not found.`,
    'Please make sure the clan name is correct and try again.',
  ];

  const embed = new EmbedBuilder()
    .setTitle('No clan found')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.INFO);

  return embed;
}

export function clanSetupErrorEmbed() {
  const description = [
    'Something went wrong while setting up the clan. Please report this error to the developer and include the timestamp shown below.',
  ];

  const embed = new EmbedBuilder()
    .setTitle('Error setting up clan')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.ERROR)
    .setTimestamp(new Date());

  return embed;
}

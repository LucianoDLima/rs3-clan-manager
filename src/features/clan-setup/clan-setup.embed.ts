import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../../shared/embeds/colors';

export function clanIsConfiguredEmbed(clanName: string) {
  const description = [
    `This server is already set up with the clan: **${clanName}**.`,
    '',
    'If the clan name is incorrect, it will not be able to pull data from the runemetrics. It is currently not possible to change the clan name once it has been set up. If you need to change the clan name, please contact the developer to reset the clan configuration for this server.',
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


import { EmbedBuilder } from 'discord.js';
import { Clan } from '@prisma/client';
import { embedCons } from './_util';

export function embedClanSetupSuccess(clan: Clan) {
  const description = [`Clan **${clan.name}** has been successfully created!`];

  const successMessage = new EmbedBuilder()
    .setTitle('Clan created!')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.SUCCESS);

  return { successMessage };
}

export function embedClanSetupError() {
  const description = [
    'Something went wrong while setting up the clan. Please report this error to the developer and include the timestamp shown below.',
  ];

  const errorMessage = new EmbedBuilder()
    .setTitle('Error setting up clan')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.ERROR)
    .setTimestamp(new Date());

  return { errorMessage };
}

export function embedClanAlreadyConfigured(clan: Clan) {
  const description = [
    `This server is already set up with the clan: **${clan.name}**.`,
    'If the clan name is incorrect, it will not be able to pull data from the runemetrics.',
    '- You can change the clan name with the `/config rename` command.',
    'Note that changing the clan name should only be done if you changed the clan name in-game and the current name is no longer correct, otherwise you might break the connection to runemetrics and it will stop pulling data.',
  ];

  const infoMessage = new EmbedBuilder()
    .setTitle('Clan has already been configured')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.INFO);

  return { infoMessage };
}

export function embedNoClanFound(clan: Clan) {
  const description = [
    `The clan **${clan.name}** was not found.`,
    'Please make sure the clan name is correct and try again.',
  ];

  const noClanFound = new EmbedBuilder()
    .setTitle('No clan found')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.INFO);

  return { noClanFound };
}

export function embedSyncReport(
  totalActive: number,
  added: number,
  leavers: number,
  rankChanges: number,
) {
  const description = [
    `**${totalActive}** active members.\n`,
    `**${added}** new member(s) added.`,
    `**${leavers}** member(s) marked as inactive.`,
    `**${rankChanges}** member(s) had rank changes.`,
  ];

  if (added === 0 && leavers === 0 && rankChanges === 0) {
    description.push('\nNo changes detected since the last sync.');
  }

  const syncReport = new EmbedBuilder()
    .setTitle('Clan Sync Complete')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.SUCCESS);

  return { syncReport };
}

import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../../shared/embeds/colors';

export function syncReportEmbed(
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

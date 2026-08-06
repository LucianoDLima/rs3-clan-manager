import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../../shared/embeds/colors';

export function syncReportEmbed(
  totalActive: number,
  added: number,
  leavers: number,
  rankChanges: number,
  expChanges: number,
) {
  const description = [
    `**${totalActive}** members.\n`,
    `**${expChanges}** member(s) confirmed active via experience gain.`,
    `**${added}** new member(s) added.`,
    `**${rankChanges}** member(s) had rank changes.`,
    `**${leavers}** member(s) marked as inactive.`,
  ];

  if (added === 0 && leavers === 0 && rankChanges === 0 && expChanges === 0) {
    description.push('\nNo changes detected since the last sync.');
  }

  const syncReport = new EmbedBuilder()
    .setTitle('Clan Sync Complete')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.SUCCESS);

  return { syncReport };
}

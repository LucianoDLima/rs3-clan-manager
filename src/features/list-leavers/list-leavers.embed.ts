import { EmbedBuilder } from "discord.js";
import { ILeavers } from "./list-leavers.type";
import { embedCons } from "../../bot/embeds/_util";

export function leaversListEmbed(leavers: ILeavers[], page: number) {
  const PAGE_SIZE = 25;
  const start = page * PAGE_SIZE;
  const pageLeavers = leavers.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(leavers.length / PAGE_SIZE) || 1;

  const embed = new EmbedBuilder()
    .setTitle(`List of members who left clan`)
    .setColor(embedCons.color.INFO)
    .setFooter({
      text: `${page > 0 ? 'Page ' + (page + 1) + ' of ' + totalPages : ' '}`,
    });

  if (leavers.length === 0) {
    return embed.setDescription('No members have left the clan.');
  }

  const now = Date.now();
  const msInDay = 1000 * 60 * 60 * 24;
  const description: string[] = [];

  const header = [
    '```text',
    '╒═════╤══════════════╤══════════════╤══════════╕',
    '│     │              │              │ Left     │',
    '│  #  │ Name         │ Rank         │ x days   │',
    '├─────┼──────────────┼──────────────┼──────────┤',
  ];

  const rows = pageLeavers.map((m, index) => {
    const daysAgo = m.leftDate
      ? Math.floor((now - m.leftDate.getTime()) / msInDay).toString()
      : 'N/A';

    const id = (start + index + 1).toString().padStart(3, ' ');
    const name = m.name.padEnd(12, ' ').substring(0, 12);
    const rank = m.rank.padEnd(12, ' ').substring(0, 12);
    const exp = daysAgo.padEnd(8, ' ').substring(0, 8);

    return `│ ${id} │ ${name} │ ${rank} │ ${exp} │`;
  });

  const footer = ['╘═════╧══════════════╧══════════════╧══════════╛', '```'];

  description.push([...header, ...rows, ...footer].join('\n'));

  return embed.setDescription(description.join('\n'));
}
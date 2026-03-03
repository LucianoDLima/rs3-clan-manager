import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../bot/embeds/_util';

type ExceptionMember = {
  name: string;
  rank: string;
  lastExpUpdate: Date | null;
};

export function listExceptions(exceptions: ExceptionMember[], page: number) {
  const PAGE_SIZE = 25;
  const start = page * PAGE_SIZE;
  const pageExceptions = exceptions.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(exceptions.length / PAGE_SIZE) || 1;

  const embed = new EmbedBuilder()
    .setTitle(`Exception List`)
    .setColor(embedCons.color.INFO)
    .setFooter({
      text: `${page > 0 ? 'Page ' + (page + 1) + ' of ' + totalPages : ' '}`,
    });

  if (exceptions.length === 0) {
    return embed.setDescription('No members are currently marked as exceptions.');
  }

  const now = Date.now();
  const msInDay = 1000 * 60 * 60 * 24;
  const description: string[] = [];

  const header = [
    '```text',
    '╒═════╤══════════════╤══════════════╤══════════╕',
    '│     │              │              │ Last     │',
    '│  #  │ Name         │ Rank         │ Online   │',
    '├─────┼──────────────┼──────────────┼──────────┤',
  ];

  const rows = pageExceptions.map((m, index) => {
    const daysAgo = m.lastExpUpdate
      ? Math.floor((now - m.lastExpUpdate.getTime()) / msInDay).toString()
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

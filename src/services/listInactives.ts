import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../bot/embeds/_util';

interface InactiveMember {
  name: string;
  rank: string;
  lastExpUpdate: Date | null;
  lastActivity: Date | null;
}

/**
 * Render an embed with the list of inactive members
 *
 * @param inactives Array of inactive members to render
 * @param page Current page number
 */
export function listInactives(inactives: InactiveMember[], page: number) {
  const PAGE_SIZE = 25;
  const start = page * PAGE_SIZE;
  const pageInactives = inactives.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(inactives.length / PAGE_SIZE) || 1;

  const embed = new EmbedBuilder()
    .setTitle(`Inactive List`)
    .setColor(embedCons.color.INFO)
    .setFooter({
      text: `${page > 0 ? 'Page ' + (page + 1) + ' of ' + totalPages : ' '}`,
    });

  if (inactives.length === 0) {
    return embed.setDescription('No members are currently marked as inactive. Did you run `/config create` yet?');
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

  const rows = pageInactives.map((m, index) => {
    const targetDate = m.lastExpUpdate ?? m.lastActivity;

    const daysAgo = targetDate
      ? Math.floor((now - targetDate.getTime()) / msInDay).toString()
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

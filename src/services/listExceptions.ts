import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../bot/embeds/_util';

type ExceptionMember = {
  name: string;
  rank: string;
  lastExpUpdate: Date | null;
};

export function listExceptions(exceptions: ExceptionMember[]) {
  let description = [];

  if (exceptions.length === 0) {
    description.push('No members are currently marked as exceptions.');
  }

  if (exceptions.length > 0) {
    const now = Date.now();
    const msInDay = 1000 * 60 * 60 * 24;

    const header = [
      '```text',
      '╒════╤══════════════╤══════════════╤══════════╕',
      '│ ## │ Name         │ Rank         │ Last Exp │',
      '├────┼──────────────┼──────────────┼──────────┤',
    ];

    const rows = exceptions.map((m, index) => {
      const daysAgo = m.lastExpUpdate
        ? Math.floor((now - m.lastExpUpdate.getTime()) / msInDay).toString()
        : 'N/A';

      const id = (index + 1).toString().padStart(2, ' ');
      const name = m.name.padEnd(12, ' ');
      const rank = m.rank.padEnd(12, ' ');
      const exp = daysAgo.padEnd(8, ' ');

      return `│ ${id} │ ${name} │ ${rank} │ ${exp} │`;
    });

    const footer = ['╘════╧══════════════╧══════════════╧══════════╛', '```'];

    description.push([...header, ...rows, ...footer].join('\n'));
  }

  return new EmbedBuilder()
    .setTitle(`Clan Exceptions`)
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.INFO);
}

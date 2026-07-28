import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../../shared/embeds/colors';
import { IExceptionMember } from './list-exceptions.type';

export function activeMemberNotFoundEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Member not found')
    .setDescription(
      `Could not find an active member named **${memberName}** in the clan.`,
    )
    .setColor(embedCons.color.INFO);
}

export function exceptionAddedEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Member added')
    .setDescription(`**${memberName}** was added to the exception list.`)
    .setColor(embedCons.color.INFO);
}

export function exceptionMemberNotFoundEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Member not found')
    .setDescription(`**${memberName}** is not in the exception list.`)
    .setColor(embedCons.color.INFO);
}

export function exceptionRemovedEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Member removed')
    .setDescription(`Removed **${memberName}** from the exception list.`)
    .setColor(embedCons.color.INFO);
}

export function exceptionListEmbed(exceptions: IExceptionMember[], page: number) {
  const pageSize = 25;
  const start = page * pageSize;
  const pageExceptions = exceptions.slice(start, start + pageSize);
  const totalPages = Math.ceil(exceptions.length / pageSize) || 1;

  const embed = new EmbedBuilder()
    .setTitle('Exception List')
    .setColor(embedCons.color.INFO)
    .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

  const noExceptions = exceptions.length === 0;
  if (noExceptions) {
    return embed.setDescription('No members currently on the exception list.');
  }

  const now = Date.now();
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const rows = pageExceptions.map((member, index) => {
    const activityDate = member.lastExpUpdate ?? member.lastActivity;
    const daysAgo = activityDate
      ? Math.floor((now - activityDate.getTime()) / millisecondsPerDay).toString()
      : 'N/A';

    const number = (start + index + 1).toString().padStart(3, ' ');
    const name = member.name.padEnd(12, ' ').slice(0, 12);
    const rank = member.rank.padEnd(12, ' ').slice(0, 12);
    const lastOnline = daysAgo.padEnd(8, ' ').slice(0, 8);

    return `│ ${number} │ ${name} │ ${rank} │ ${lastOnline} │`;
  });

  return embed.setDescription(
    [
      '```text',
      '┌─────┬──────────────┬──────────────┬──────────┐',
      '│  #  │ Name         │ Rank         │ Last     │',
      '│     │              │              │ Online   │',
      '├─────┼──────────────┼──────────────┼──────────┤',
      ...rows,
      '└─────┴──────────────┴──────────────┴──────────┘',
      '```',
    ].join('\n'),
  );
}

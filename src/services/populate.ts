import { Clan, Member } from '@prisma/client';
import { ChatInputCommandInteraction } from 'discord.js';
import { createMembers } from '../database/member/createMember';

type ClanMemberData = Pick<Member, 'name' | 'rank' | 'currentExp'>;

export async function fetchClanMembers(clanName: string): Promise<ClanMemberData[]> {
  const url = `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(clanName)}`;

  const response = await fetch(url);

  if (!response.ok) throw new Error('Failed to fetch from RuneScape API');

  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const rawText = decoder.decode(buffer);

  const lines = rawText.trim().split('\n');

  const members = lines.slice(1).map((line) => {
    const [name, rank, xp] = line.split(',');

    return {
      name: name.replace(/\u00A0/g, ' '),
      rank,
      currentExp: BigInt(xp) || 0n,
    };
  });

  return members;
}

export async function addMembers(
  clan: Clan,
  interaction: ChatInputCommandInteraction,
) {
  const members = await fetchClanMembers(clan.name);

  const membersFormatted = members.map((m) => ({
    name: m.name,
    rank: m.rank,
    clanId: clan.id,
    currentExp: BigInt(m.currentExp),
  }));

  const result = await createMembers(membersFormatted);

  await interaction.editReply({
    content: `Sync complete! ${
      result.count === 0
        ? 'No new members added.'
        : result.count === 1
          ? '1 new member added.'
          : `**${result.count}** new members added.`
    }`,
  });
}

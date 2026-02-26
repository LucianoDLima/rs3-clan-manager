import { Member } from '@prisma/client';
import { findActiveMembers } from '../database/member/findMember';
import { executeMemberSync } from '../database/member/updateMember';

export async function syncClanData(clanId: number, clanName: string) {
  const freshMembers = await fetchClanMembers(clanName);
  const freshNames = new Set(freshMembers.map((m) => m.name));

  // Active members according to last sync
  const currentMembers = await findActiveMembers(clanId);
  const currentMembersMap = new Map(currentMembers.map((m) => [m.name, m.rank]));

  // People who are currently active in `currentMembers` but arnt in `freshNames` have left the clan since last sync
  const leavers = currentMembers
    .filter((curMem) => curMem.isActive && !freshNames.has(curMem.name))
    .map((m) => m.name);

  // No logic to differenciate new members from active ones cz skipduplicate on the query
  const newMembers = freshMembers.map((m) => ({
    name: m.name,
    rank: m.rank,
    clanId: clanId,
    currentExp: m.currentExp,
  }));

  const rankChanges = freshMembers
    .filter((fresh) => {
      const oldRank = currentMembersMap.get(fresh.name);
      return oldRank && oldRank !== fresh.rank;
    })
    .map((fresh) => ({
      name: fresh.name,
      oldRank: currentMembersMap.get(fresh.name)!,
      newRank: fresh.rank,
    }));

  const syncedMembers = await executeMemberSync(
    clanId,
    leavers,
    newMembers,
    [...freshNames],
    rankChanges,
  );

  return {
    totalActiveNow: freshMembers.length,
    leaversCount: leavers.length,
    newMembers: syncedMembers[1].count,
    rankChanges: rankChanges.length,
  };
}

type ClanMemberData = Pick<Member, 'name' | 'rank' | 'currentExp'>;

async function fetchClanMembers(clanName: string): Promise<ClanMemberData[]> {
  const url = `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(clanName)}`;

  const response = await fetch(url);

  // Need to see how to handle error in this case since it's not really an api call, so it always returns 200 even when it errors

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

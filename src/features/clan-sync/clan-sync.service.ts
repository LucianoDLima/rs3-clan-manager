import {
  IActiveMember,
  IFreshMember,
  IRuneMetricsResponse,
  TMemberMap,
} from './clan-sync.type';
import {
  executeMemberSync,
  getActiveMembers,
  findLastExpUpdateNull,
  updateLastActivity,
} from './clan-sync.repository';

/**
 * Sync members data from a clan from RuneScape's hiscores with the local database.
 *
 * - Check who's a new player then add it to the database
 * - Check who left the clan, then mark them as inactive in the database
 * - Check who had rank changed, then update their ranks
 * - Compare database experience with the current fetched hiscores experience, then update in the db to check if the member has been active
 *
 * @param clanId - The database ID of the clan.
 * @param clanName - The exact name of the clan in RuneScape.
 * @returns An object containing:
 * - `totalActiveNow`: The number of active members in the clan.
 * - `leaversCount`: The number of members who left the clan since the last sync.
 * - `newMembers`: The number of new members added to the database.
 * - `rankChanges`: The number of members who had rank changes since the last sync.
 * - `expChanges`: The number of members who had experience changes since the last sync.
 */
export async function syncClanData(clanId: number, clanName: string) {
  const { hiscoreMembersData, hiscoreMembersName } =
    await fetchClanHiscoreMembers(clanName);
  const { activeMembers, activeMembersMap } = await getClanMembersSnapshot(clanId);

  const leavers = getClanLeavers(activeMembers, hiscoreMembersName);
  const newMembers = getNewMembers(hiscoreMembersData, clanId);
  const rankChanges = getRankChanges(hiscoreMembersData, activeMembersMap);
  const expChanges = getExpChanges(hiscoreMembersData, activeMembersMap);

  const syncedMembers = await executeMemberSync(
    clanId,
    leavers,
    newMembers,
    [...hiscoreMembersName],
    rankChanges,
    expChanges,
  );

  console.log(expChanges);

  return {
    totalActiveNow: hiscoreMembersData.length,
    leaversCount: leavers.length,
    newMembers: syncedMembers[1].count,
    rankChanges: rankChanges.length,
    expChanges: expChanges.length,
  };
}

/**
 * Fetch the current members' from the clan in the hiscores
 *
 * @param clanName - The exact name of the clan
 * @returns An object containing:
 * - `hiscoreMembersData`: An array of parsed data: name, rank and total exp
 * - `hiscoreMembersName`: A Set of all member names to be used for fast look up
 */
async function fetchClanHiscoreMembers(clanName: string) {
  const url = `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(clanName)}`;

  const response = await fetch(url);

  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const rawText = decoder.decode(buffer);

  const lines = rawText.trim().split('\n');

  const hiscoreMembersData = lines.slice(1).map((line) => {
    const [name, rank, xp] = line.split(',');

    return {
      name: name.replace(/\u00A0/g, ' '),
      rank,
      currentExp: BigInt(xp) || 0n,
    };
  });

  const hiscoreMembersName = new Set(hiscoreMembersData.map((m) => m.name));

  return { hiscoreMembersData, hiscoreMembersName };
}

/**
 * Get a snapshot of the clan's current active members for comparison during sync.
 *
 * @param clanId - The ID of the clan
 * @returns An object containing:
 * - `activeMembers`: An array of the active members
 * - `activeMembersMap`: A Map keyed by member name, containing their rank and experience for fast lookups
 */
async function getClanMembersSnapshot(clanId: number) {
  const activeMembers = await getActiveMembers(clanId);

  const activeMembersMap = new Map(
    activeMembers.map((m) => [m.name, { rank: m.rank, currentExp: m.currentExp }]),
  );

  return { activeMembers, activeMembersMap };
}

/**
 * Find members who are no longer in the latest hiscores data.
 *
 * @param activeMembers - An array of the active members currently stored in the database
 * @param freshMembersNames - A Set of the names of the members fetched from the hiscores
 * @returns An object containing an array with the name of all members who left the clan.
 */
function getClanLeavers(
  activeMembers: IActiveMember[],
  freshMembersNames: Set<string>,
) {
  const leavers = activeMembers
    .filter((curMem) => curMem.isActive && !freshMembersNames.has(curMem.name))
    .map((m) => m.name);

  return leavers;
}

/**
 * Find new members by comparing the fresh members fetched from the hiscores with the current active members in the database.
 *
 * * Note: Skipduplicate on the query already handles duplication of new members from active members
 *
 * @param clanHiscoreMembersData - An array of parsed data: name, rank and total exp
 * @param clanId - The database ID of the clan.
 * @returns An array with the name of all new members to be added to the database.
 */
function getNewMembers(clanHiscoreMembersData: IFreshMember[], clanId: number) {
  const newMembers = clanHiscoreMembersData.map((m) => ({
    name: m.name,
    rank: m.rank,
    clanId: clanId,
    currentExp: m.currentExp,
  }));

  return newMembers;
}

/**
 * Find members whose rank changed by comparing hiscores data with the current database snapshot
 *
 * @param clanHiscoreMembersData - Parsed hiscores data (name, rank, exp)
 * @param currentMembersData - Map keyed by member name containing current rank and experience
 * @returns An array of members with their old and new ranks
 */
function getRankChanges(
  clanHiscoreMembersData: IFreshMember[],
  currentMembersData: TMemberMap,
) {
  const rankChanges = clanHiscoreMembersData
    .filter((fresh) => {
      const oldData = currentMembersData.get(fresh.name);
      return oldData && oldData.rank !== fresh.rank;
    })
    .map((fresh) => ({
      name: fresh.name,
      oldRank: currentMembersData.get(fresh.name)!.rank,
      newRank: fresh.rank,
    }));

  return rankChanges;
}

/**
 * Find members whose experience increased by comparing hiscores data with the current database snapshot
 *
 * @param clanHiscoreMembersData - Parsed hiscores data (name, rank, exp)
 * @param currentMembersMap - Map keyed by member name containing current rank and experience
 * @returns An array of members with their updated experience
 */
function getExpChanges(
  clanHiscoreMembersData: IFreshMember[],
  currentMembersMap: TMemberMap,
) {
  const expChanges = clanHiscoreMembersData
    .filter((fresh) => {
      const oldData = currentMembersMap.get(fresh.name);
      return oldData && fresh.currentExp > oldData.currentExp;
    })
    .map((fresh) => ({
      name: fresh.name,
      newExp: fresh.currentExp,
    }));

  return expChanges;
}

// ------------------------- Null lastExpUpdate sync -------------------------

/**
 * Sync members with null lastExpUpdate by fetching their profile and checking the last activity date.
 *
 * @param clanId - The ID of the clan
 */
export async function syncMissingLastOnline(clanId: number) {
  const members = await findLastExpUpdateNull(clanId);

  for (const member of members) {
    await processMemberActivity(clanId, member);
    // to try preventing 429 rate limit error
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`Done for ${clanId}`);
}

/**
 * Fetch the member's profile to check the last activity date and update the database
 *
 * @param clanId - The ID of the clan
 * @param member - An object containing the member's ID and name
 */
async function processMemberActivity(
  clanId: number,
  member: { id: number; name: string },
) {
  try {
    const url = `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(member.name)}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(
        `${clanId} - ${member.name} - Skip: Server returned ${res.status}`,
      );

      return;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(
        `${clanId} - ${member.name} - Skipped: Received HTML instead of JSON`,
      );

      return;
    }

    const data = (await res.json()) as IRuneMetricsResponse;

    if (data.error === 'PROFILE_PRIVATE') {
      // TODO: Add a row in the db to mark it as private maybe?
      console.log(`${clanId} - ${member.name} - Skipped: Private Profile.`);

      return;
    }

    if (data.activities?.length) {
      const firstActivityDate = new Date(data.activities[0].date);
      await updateLastActivity(member.id, firstActivityDate);
      console.log(
        `${clanId} - ${member.name} - Updated: ${firstActivityDate.toISOString()}`,
      );
    }
  } catch (error) {
    console.error(`${clanId} - ${member.name} - error:`, error);
  }
}

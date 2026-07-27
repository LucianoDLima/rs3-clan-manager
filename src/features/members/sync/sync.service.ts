import {
  executeMemberSync,
  findActiveMembers,
  findLastExpUpdateNull,
  updateLastActivity,
} from '../members.repository';
import {
  ICurrentMember,
  IFreshMember,
  IRuneMetricsResponse,
  TMemberMap,
} from '../members.type';

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
 */
export async function syncClanData(clanId: number, clanName: string) {
  const { freshMembersData, freshMembersName } = await fetchFreshMembers(clanName);
  const { currentMembers, currentMembersMap } = await fetchCurrentMembers(clanId);

  const leavers = getLeavers(currentMembers, freshMembersName);
  const newMembers = getNewMembers(freshMembersData, clanId);
  const rankChanges = getRankChanges(freshMembersData, currentMembersMap);
  const expChanges = getExpChanges(freshMembersData, currentMembersMap);

  const syncedMembers = await executeMemberSync(
    clanId,
    leavers,
    newMembers,
    [...freshMembersName],
    rankChanges,
    expChanges,
  );

  return {
    totalActiveNow: freshMembersData.length,
    leaversCount: leavers.length,
    newMembers: syncedMembers[1].count,
    rankChanges: rankChanges.length,
  };
}

/**
 * Fetch the current members' data from the hiscores
 *
 * * Note: This function assumes the clan name is valid since it's not possible to create a clan that does not exist (validation in place on creation).
 * * Also, the RuneScape endpoint does not return standard HTTP errors for missing clans; it silently redirects to the global rankings page.
 *
 * @param clanName - The exact name of the clan
 * @returns An object containing:
 * - `freshMembersData`: An array of parsed data: name, rank and total exp
 * - `freshMembersName`: A Set of all member names that will be used for fast look up
 */
async function fetchFreshMembers(clanName: string) {
  const url = `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(clanName)}`;

  const response = await fetch(url);

  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const rawText = decoder.decode(buffer);

  const lines = rawText.trim().split('\n');

  const freshMembersData = lines.slice(1).map((line) => {
    const [name, rank, xp] = line.split(',');

    return {
      name: name.replace(/\u00A0/g, ' '),
      rank,
      currentExp: BigInt(xp) || 0n,
    };
  });

  const freshMembersName = new Set(freshMembersData.map((m) => m.name));

  return { freshMembersData, freshMembersName };
}

/**
 * Fetch current active clan members from the database.
 *
 * @param clanId - The ID of the clan
 * @returns An object containing:
 * - `currentMembers`: An array of the active members currently stored in the database.
 * - `currentMembersMap`: A Map keyed by member name, containing their rank and experience for fast lookups.
 */
async function fetchCurrentMembers(clanId: number) {
  const currentMembers = await findActiveMembers(clanId);
  const currentMembersMap = new Map(
    currentMembers.map((m) => [m.name, { rank: m.rank, currentExp: m.currentExp }]),
  );

  return { currentMembers, currentMembersMap };
}

/**
 * Find members who have left the clan by comparing the current active members in the database with the fresh members fetched from the hiscores
 *
 * @param currentMembers - An array of the active members currently stored in the database.
 * @param freshMembersName - A Set of all member names
 * @returns An object containing an array with the name of all members who left the clan.
 */
function getLeavers(
  currentMembers: ICurrentMember[],
  freshMembersName: Set<string>,
) {
  const leavers = currentMembers
    .filter((curMem) => curMem.isActive && !freshMembersName.has(curMem.name))
    .map((m) => m.name);

  return leavers;
}

/**
 * Find new members by comparing the fresh members fetched from the hiscores with the current active members in the database.
 *
 * * Note: Skipduplicate on the query already handles duplication of new members from active members
 *
 * @param freshMembersData - An array of parsed data: name, rank and total exp
 * @param clanId - The database ID of the clan.
 * @returns An array with the name of all new members to be added to the database.
 */
function getNewMembers(freshMembersData: IFreshMember[], clanId: number) {
  const newMembers = freshMembersData.map((m) => ({
    name: m.name,
    rank: m.rank,
    clanId: clanId,
    currentExp: m.currentExp,
  }));

  return newMembers;
}

/**
 * Find members who had rank changes by comparing the fresh members fetched from the hiscores with the current active members in the database.
 *
 * @param freshMembersData - An array of parsed data: name, rank and total exp
 * @param currentMembersData - A Map keyed by member name, containing their rank and experience for fast lookups.
 * @returns An array with the name of all members who had rank changes with their old and new ranks.
 */
function getRankChanges(
  freshMembersData: IFreshMember[],
  currentMembersData: TMemberMap,
) {
  const rankeChanges = freshMembersData
    .filter((fresh) => {
      const oldData = currentMembersData.get(fresh.name);
      return oldData && oldData.rank !== fresh.rank;
    })
    .map((fresh) => ({
      name: fresh.name,
      oldRank: currentMembersData.get(fresh.name)!.rank,
      newRank: fresh.rank,
    }));

  return rankeChanges;
}

/**
 * Find members who had experience changes by comparing the fresh members fetched from the hiscores with the current active members in the database.
 *
 * @param freshMembersData - An array of parsed data: name, rank and total exp
 * @param currentMembersData - A Map keyed by member name, containing their rank and experience for fast lookups.
 * @returns An array with the name and exp of all members who had experience changes.
 */
function getExpChanges(
  freshMembersData: IFreshMember[],
  currentMembersMap: TMemberMap,
) {
  const expChanges = freshMembersData
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

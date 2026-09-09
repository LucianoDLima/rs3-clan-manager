import {
  findInactiveMembersByExpAndActivity,
  updateLastActivity,
} from './sync-activity.repository';
import { IRuneMetricsResponse } from './sync-activity.type';

/**
 * Sync members with lastExpUpdate null or older than 30 days by checking their last activity date.
 *
 * @param clanId - The ID of the clan
 */
export async function syncByActivity(clanId: number) {
  // Gonna leave it at 30 for now but might make it a parameter later
  const members = await findInactiveMembersByExpAndActivity(clanId, 30);

  for (const member of members) {
    await executeSync(clanId, member);

    // to try preventing 429 rate limit error
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`Done for ${clanId}`);
}

/**
 * Fetch the member's profile on the hiscores to check the last activity date and update the database
 *
 * @param clanId - The ID of the clan
 * @param member - An object containing the member's ID and name
 */
async function executeSync(clanId: number, member: { id: number; name: string }) {
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

    console.log(data);

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

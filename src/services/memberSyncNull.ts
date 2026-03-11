import { findLastExpUpdateNull } from '../database/member/findMember';
import { updateLastActivity } from '../database/member/updateMember';

type RuneMetricsResponse = {
  error?: string;
  activities?: {
    date: string;
  }[];
};

export async function syncMissingLastOnline(clanId: number) {
  const members = await findLastExpUpdateNull(clanId);

  for (const member of members) {
    try {
      const url = `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(member.name)}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.warn(`${clanId} - ${member.name} - Skip: Server returned ${res.status}`);
        continue;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(
          `${clanId} - ${member.name} - Skip: Received HTML instead of JSON (API Lag, it shouldn't happen)`,
        );
        continue;
      }

      const data = (await res.json()) as RuneMetricsResponse;

      if (data.error === 'PROFILE_PRIVATE') {
        // TODO: Add a row in the db to mark it as private maybe?
        console.log(`${clanId} - ${member.name} - Skipped: Private Profile.`);
        continue;
      }

      if (data.activities?.length) {
        const firstActivityDate = new Date(data.activities[0].date);
        await updateLastActivity(member.id, firstActivityDate);
        console.log(`${clanId} - ${member.name} - Updated: ${firstActivityDate.toISOString()}`);
      }
    } catch (error) {
      console.error(`${clanId} - ${member.name} - error:`, error);
    }

    // to avoid 429 rate limit error
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`Done for ${clanId}`);
}

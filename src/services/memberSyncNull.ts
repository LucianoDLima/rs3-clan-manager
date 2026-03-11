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
      const data = (await res.json()) as RuneMetricsResponse;

      if (data.error === 'PROFILE_PRIVATE') {
        // TODO: Add a row in the db to mark it as private maybe?
        console.log(`${member.name} - Skipped: Private Profile.`);
        continue;
      }

      if (data.activities?.length) {
        const firstActivityDate = new Date(data.activities[0].date);

        await updateLastActivity(member.id, firstActivityDate);

        console.log(`${member.name} - Updated: ${firstActivityDate.toISOString()}`);
      }
    } catch (error) {
      console.error(`${member.name} - error at ${new Date().toISOString()}:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

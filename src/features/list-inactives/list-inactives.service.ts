import { findInactiveMembers } from './list-inactives.repository';
import { IInactiveMember } from './list-inactives.type';

/**
 * Wrap that returns the members that are currently marked as inactives
 *
 * @param clanID The ID of the clan to fetch inactive members for
 * @param daysInactive The number of days a member must be inactive to be included in the list
 */
export async function listInactives(clanId: number, daysInactive: number) {
  return await findInactiveMembers(clanId, daysInactive);
}

// Send the list of inactive members as a text file attachment, names only and sorted alphabetically.
export function buildInactiveListText(inactives: IInactiveMember[]) {
  if (inactives.length === 0) {
    return 'No inactive members.';
  }

  const sortedNames = inactives
    .map((m) => m.name)
    .sort((a, b) => a.localeCompare(b));

  return sortedNames.join('\n');
}

import { findInactiveMembers } from './list-inactives.repository';

/**
 * Wrap that returns the members that are currently marked as inactives
 *
 * @param clanID The ID of the clan to fetch inactive members for
 * @param daysInactive The number of days a member must be inactive to be included in the list
 */
export async function listInactives(clanId: number, daysInactive: number) {
  return await findInactiveMembers(clanId, daysInactive);
}

import { findLeavers } from './list.leavers.repository';

/**
 * Render an embed with the list of inactive members, paginated by 25 per page
 *
 * @param leavers Array of  members to render
 * @param page Current page number (0-indexed)
 */
export async function listLeavers(clanId: number) {
  return await findLeavers(clanId);
}

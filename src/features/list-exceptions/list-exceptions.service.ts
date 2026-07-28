import {
  findActiveMember,
  findExceptionMembers,
  setExceptionStatus,
} from './list-exceptions.repository';

/**
 * Add a member to the exception list
 *
 * TODO:
 * 1 - Add a check to ensure that the member is not already in the exception list before adding them
 * 2 - Make it not be case sensitive when searching for the member
 *
 * @param clanId - ID of the clan where the exception will be added
 * @param member - Name of the member that will be added to the exception
 */
export async function addException(clanId: number, member: string) {
  const exceptionMember = await findActiveMember(clanId, member);

  if (!exceptionMember) return null;

  await setExceptionStatus(clanId, member, true);

  return exceptionMember;
}

/**
 * Remove a member from the exception list
 *
 * TODO:
 * 1 - Make it not be case sensitive when searching for the member
 *
 * @param clanId - ID of the clan where the exception will be removed
 * @param member - Name of the member that will be removed from the exception
 */
export async function deleteException(clanId: number, member: string) {
  const exceptionMember = await findActiveMember(clanId, member);

  if (!exceptionMember) return null;

  await setExceptionStatus(clanId, member, false);

  return exceptionMember;
}

// Wrap that returns the members that are currently marked as exceptions
export async function listExceptions(clanId: number) {
  return await findExceptionMembers(clanId);
}

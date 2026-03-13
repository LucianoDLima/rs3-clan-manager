import { findMember } from '../database/member/findMember';
import { updateException } from '../database/member/updateMember';

export async function addException(clanId: number, member: string) {
  const exceptionMember = await findMember(clanId, member);

  if (!exceptionMember) return null;

  await updateException(clanId, member, true);

  return exceptionMember;
}

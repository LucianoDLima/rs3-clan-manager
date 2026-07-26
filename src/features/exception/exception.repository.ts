import prisma from '../../prisma/client.prisma';

export async function setExceptionStatus(
  clanId: number,
  memberName: string,
  isException: boolean,
) {
  return await prisma.member.updateMany({
    where: { clanId, name: memberName, isActive: true },
    data: { isException },
  });
}

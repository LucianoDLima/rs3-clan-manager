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

export async function findExceptionMembers(clanId: number) {
  return await prisma.member.findMany({
    where: { clanId, isActive: true, isException: true },
    select: {
      name: true,
      rank: true,
      lastExpUpdate: true,
      lastActivity: true,
    },
  });
}

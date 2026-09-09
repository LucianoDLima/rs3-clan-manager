import prisma from '../../prisma/client.prisma';

export async function findInactiveMembersByExpAndActivity(
  clanId: number,
  daysInactive = 30,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  return await prisma.member.findMany({
    where: {
      clanId,
      isActive: true,

      AND: [
        {
          OR: [{ lastExpUpdate: null }, { lastExpUpdate: { lt: cutoffDate } }],
        },
        {
          OR: [{ lastActivity: null }, { lastActivity: { lt: cutoffDate } }],
        },
      ],
    },
    select: { id: true, name: true },
  });
}

export async function updateLastActivity(memberId: number, lastActivity: Date) {
  return await prisma.member.update({
    where: { id: memberId },
    data: { lastActivity },
  });
}

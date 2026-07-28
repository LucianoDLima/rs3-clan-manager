import prisma from '../../prisma/client.prisma';

export async function findLeavers(clanId: number) {
  const leavers = await prisma.member.findMany({
    where: { clanId, isActive: false },
    select: { name: true, rank: true, leftDate: true },
  });

  return leavers;
}

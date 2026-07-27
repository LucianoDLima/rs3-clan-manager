import prisma from '../../prisma/client.prisma';

export async function findMember(clanId: number, member: string) {
  const foundMember = await prisma.member.findFirst({
    where: { clanId, name: member, isActive: true },
    select: { name: true },
  });

  return foundMember;
}

export async function findLeavers(clanId: number) {
  const leavers = await prisma.member.findMany({
    where: { clanId, isActive: false },
    select: { name: true, rank: true, leftDate: true },
  });

  return leavers;
}

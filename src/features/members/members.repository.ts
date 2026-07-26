import prisma from '../../prisma/client.prisma';

export async function findActiveMember(clanId: number, memberName: string) {
  const foundMember = await prisma.member.findFirst({
    where: { clanId, name: memberName, isActive: true },
    select: { name: true },
  });

  return foundMember;
}

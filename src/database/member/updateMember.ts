import { Clan, Prisma } from '@prisma/client';
import prisma from '../../prisma/client.prisma';

export async function executeMemberSync(
  clanId: Clan['id'],
  leavers: string[],
  freshMembers: Prisma.MemberCreateManyInput[],
  freshNames: string[],
  rankChanges: { name: string; newRank: string }[],
) {
  const rankUpdateQueries = rankChanges.map((change) =>
    prisma.member.updateMany({
      where: { clanId, name: change.name },
      data: { rank: change.newRank },
    }),
  );

  return await prisma.$transaction([
    prisma.member.updateMany({
      where: { clanId, name: { in: leavers } },
      data: { isActive: false, leftDate: new Date() },
    }),

    prisma.member.createMany({
      data: freshMembers,
      skipDuplicates: true,
    }),

    ...rankUpdateQueries,

    prisma.member.updateMany({
      where: { clanId, name: { in: freshNames }, isActive: false },
      data: { isActive: true, leftDate: null },
    }),
  ]);
}

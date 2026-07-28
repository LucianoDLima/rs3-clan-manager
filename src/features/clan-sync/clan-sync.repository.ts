import prisma from '../../prisma/client.prisma';
import { Clan, Prisma } from '@prisma/client';

export async function executeMemberSync(
  clanId: Clan['id'],
  leavers: string[],
  freshMembers: Prisma.MemberCreateManyInput[],
  freshNames: string[],
  rankChanges: { name: string; newRank: string }[],
  expChanges: { name: string; newExp: bigint }[],
) {
  const rankUpdateQueries = rankChanges.map((change) =>
    prisma.member.updateMany({
      where: { clanId, name: change.name },
      data: { rank: change.newRank },
    }),
  );

  const expUpdateQueries = expChanges.map((change) =>
    prisma.member.updateMany({
      where: { clanId, name: change.name },
      data: {
        currentExp: change.newExp,
        lastExpUpdate: new Date(),
      },
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

    ...expUpdateQueries,
  ]);
}

export async function findLastExpUpdateNull(clanId: number, daysInactive = 30) {
  const activityDate = new Date();
  activityDate.setDate(activityDate.getDate() - daysInactive);

  return await prisma.member.findMany({
    where: {
      clanId,
      isActive: true,
      lastExpUpdate: null,
      OR: [{ lastActivity: null }, { lastActivity: { lt: activityDate } }],
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

export async function findActiveMembers(clanId: number) {
  return await prisma.member.findMany({
    where: { clanId, isActive: true },
    select: { name: true, isActive: true, rank: true, currentExp: true },
  });
}

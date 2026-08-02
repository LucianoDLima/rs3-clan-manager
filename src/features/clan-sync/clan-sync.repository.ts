import prisma from '../../prisma/client.prisma';
import { Clan, Prisma } from '@prisma/client';

export async function executeMemberSync(
  clanId: Clan['id'],
  leavers: string[],
  freshMembers: Prisma.MemberCreateManyInput[],
  returners: string[],
  rankChanges: { name: string; newRank: string }[],
  expChanges: { name: string; newExp: bigint }[],
) {
  const freshMemberData = freshMembers.map((member) => ({
    ...member,
    lastExpUpdate: new Date(),
  }));

  const buildMemberUpdateMap = (
    rankChanges: { name: string; newRank: string }[],
    expChanges: { name: string; newExp: bigint }[],
  ) => {
    const updates = new Map<string, { rank?: string; currentExp?: bigint }>();

    rankChanges.forEach(({ name, newRank }) => {
      updates.set(name, {
        ...(updates.get(name) || {}),
        rank: newRank,
      });
    });

    expChanges.forEach(({ name, newExp }) => {
      updates.set(name, {
        ...(updates.get(name) || {}),
        currentExp: newExp,
      });
    });

    return updates;
  };

  const memberUpdatesMap = buildMemberUpdateMap(rankChanges, expChanges);

  const memberUpdates = Array.from(memberUpdatesMap.entries()).map(([name, data]) =>
    prisma.member.updateMany({
      where: { clanId, name },
      data: {
        ...data,
        lastExpUpdate: data.currentExp ? new Date() : undefined,
        isActive: true,
        leftDate: null,
      },
    }),
  );

  return await prisma.$transaction([
    // Mark leavers as inactive and set their leftDate
    prisma.member.updateMany({
      where: { clanId, name: { in: leavers } },
      data: { isActive: false, leftDate: new Date() },
    }),

    // Add new members to the database, skipping duplicates
    prisma.member.createMany({
      data: freshMemberData,
      skipDuplicates: true,
    }),

    // Reactivate members who were previously marked as inactive but are now present in the fresh data
    prisma.member.updateMany({
      where: { clanId, name: { in: returners }, isActive: false },
      data: {
        isActive: true,
        leftDate: null,
        lastExpUpdate: new Date(),
      },
    }),

    // Update the rank and exp of members who had changes, and set lastExpUpdate if exp changed
    ...memberUpdates,
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

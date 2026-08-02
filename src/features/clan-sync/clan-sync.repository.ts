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

  const rankUpdate = rankChanges.map((rank) =>
    prisma.member.updateMany({
      where: { clanId, name: rank.name },
      data: { rank: rank.newRank },
    }),
  );

  const expUpdate = expChanges.map((exp) =>
    prisma.member.updateMany({
      where: { clanId, name: exp.name },
      data: {
        currentExp: exp.newExp,
        lastExpUpdate: new Date(),
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

    // Update the rank of members who have had rank changes
    ...rankUpdate,

    // Update the experience of members who have had experience changes and reset isActive and leftDate for those who were previously inactive
    ...expUpdate,
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

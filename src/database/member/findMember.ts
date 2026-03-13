import prisma from '../../prisma/client.prisma';

export async function findActiveMembers(clanId: number) {
  return await prisma.member.findMany({
    where: { clanId, isActive: true },
    select: { name: true, isActive: true, rank: true, currentExp: true },
  });
}

export async function findMember(clanId: number, member: string){
  const foundMember = await prisma.member.findFirst({
    where: { clanId, name: member, isActive: true },
    select: { name: true}
  })

  return foundMember;
}

export async function findExceptionMembers(clanId: number) {
  return await prisma.member.findMany({
    where: { clanId, isActive: true, isException: true },
    select: { name: true, rank: true, lastExpUpdate: true, lastActivity: true },
  });
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

export async function findInactiveMembers(clanId: number, daysInactive = 30) {
  const inactiveDaysAgo = new Date();
  inactiveDaysAgo.setDate(inactiveDaysAgo.getDate() - daysInactive);

  const members = await prisma.member.findMany({
    where: {
      clanId,
      isActive: true,
      isException: false,
      OR: [
        { lastExpUpdate: { lt: inactiveDaysAgo } },
        { lastExpUpdate: null, lastActivity: { lt: inactiveDaysAgo } },
      ],
    },
  });

  const membersSorted = members.sort((a, b) => {
    const dateA = a.lastExpUpdate ?? a.lastActivity;
    const dateB = b.lastExpUpdate ?? b.lastActivity;

    if (!dateA || !dateB) return 0;

    return dateA.getTime() - dateB.getTime();
  });

  return membersSorted;
}

export async function findLeavers(clanId: number) {
  const leavers = await prisma.member.findMany({
    where: { clanId, isActive: false },
    select: { name: true, rank: true, leftDate: true },
  });

  return leavers; 
}
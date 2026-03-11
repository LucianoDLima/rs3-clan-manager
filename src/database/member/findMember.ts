import { Clan } from '@prisma/client';
import prisma from '../../prisma/client.prisma';

export async function findActiveMembers(clanId: number) {
  return await prisma.member.findMany({
    where: { clanId, isActive: true },
    select: { name: true, isActive: true, rank: true, currentExp: true },
  });
}

export async function findExceptionMembers(clanId: number) {
  return await prisma.member.findMany({
    where: { clanId, isActive: true, isException: true },
    select: { name: true, rank: true, lastExpUpdate: true },
  });
}

export async function findLastExpUpdateNull(clanId: number) {
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  return await prisma.member.findMany({
    where: {
      clanId,
      isActive: true,
      lastExpUpdate: null,
      OR: [{ lastActivity: null }, { lastActivity: { lt: fifteenDaysAgo } }],
    },
    select: { id: true, name: true },
  });
}

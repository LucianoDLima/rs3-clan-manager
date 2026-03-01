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

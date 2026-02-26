import { Prisma } from '@prisma/client';
import prisma from '../../prisma/client.prisma';

export async function createMembers(players: Prisma.MemberCreateManyInput[]) {
  return await prisma.member.createMany({
    data: players,
    skipDuplicates: true,
  });
}

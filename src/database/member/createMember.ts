import { Clan } from '@prisma/client';
import prisma from '../../prisma/client.prisma';

export async function createMembers(
  players: { name: string; rank: string; currentExp: bigint; clanId: Clan['id'] }[],
) {
  return await prisma.member.createMany({
    data: players,
    skipDuplicates: true,
  });
}

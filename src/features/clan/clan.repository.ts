import { Clan } from '@prisma/client';
import prisma from '../../prisma/client.prisma';

export async function createClan(guildID: Clan['guildID'], name: string) {
  return prisma.clan.create({
    data: {
      guildID,
      name,
    },
  });
}

export async function findClan(guildID: Clan['guildID']) {
  return prisma.clan.findUnique({
    where: { guildID },
  });
}

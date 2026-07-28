import { createClan, findClan } from './clan-setup.repository';

/**
 * - Check if clan is already configured
 * - Check if clan exists
 * - Create clan
 */
export async function setupNewClan(guildId: string, clanName: string) {
  const existingClan = await findClan(guildId);
  if (existingClan) {
    return { success: false, existingClan };
  }

  const isValidClan = await validateClanExists(clanName);
  if (!isValidClan) {
    throw new Error('CLAN_NOT_FOUND');
  }

  const clan = await createClan(guildId, clanName);
  return { success: true, clan };
}

/**
 * When a clan doesnt exist, it doesnt return an error, just a redirect to the ranking page. This function validades if the clans exists based on that
 */
async function validateClanExists(clanName: string) {
  const url = `https://secure.runescape.com/m=clan-hiscores/members_lite.ws?clanName=${encodeURIComponent(clanName)}`;

  const response = await fetch(url);

  const isRedirected = !response.url.includes('members_lite.ws');
  if (isRedirected) return false;

  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const text = decoder.decode(buffer);

  const lines = text.trim().split('\n');
  return lines.length > 1;
}

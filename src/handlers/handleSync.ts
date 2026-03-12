import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { findClan } from '../database/clan/findClan';
import { embedNoClanConfig } from '../bot/embeds/generalEmbeds';
import { syncClanData } from '../services/memberSync';
import { syncMissingLastOnline } from '../services/memberSyncNull';
import { embedCons } from '../bot/embeds/_util';

export async function handleSync(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    //TODO: Add it to middleware folder or something else to reuse it
    const clan = await findClan(interaction.guildId);
    if (!clan) {
      const { noClanConfig } = embedNoClanConfig();
      await interaction.editReply({
        embeds: [noClanConfig],
      });

      return;
    }

    //TODO: Need to work on it. Gotta make so it shows up on the embed that this is an ongoing process that will take a few mins.
    // Also might need to make a way so it I cant run this command while this bit is syncing to prevent overload idk. need thinking
    const lastActivity = interaction.options.getBoolean('activity');
    if (lastActivity) {
      syncMissingLastOnline(clan.id);
    }

    const report = await syncClanData(clan.id, clan.name);

    const { syncReport } = embedSyncReport(
      report.totalActiveNow,
      report.newMembers,
      report.leaversCount,
      report.rankChanges,
    );

    await interaction.editReply({
      embeds: [syncReport],
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply('Failed to sync members.');
  }
}

function embedSyncReport(
  totalActive: number,
  added: number,
  leavers: number,
  rankChanges: number,
) {
  const description = [
    `**${totalActive}** active members.\n`,
    `**${added}** new member(s) added.`,
    `**${leavers}** member(s) marked as inactive.`,
    `**${rankChanges}** member(s) had rank changes.`,
  ];

  if (added === 0 && leavers === 0 && rankChanges === 0) {
    description.push('\nNo changes detected since the last sync.');
  }

  const syncReport = new EmbedBuilder()
    .setTitle('Clan Sync Complete')
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.SUCCESS);

  return { syncReport };
}

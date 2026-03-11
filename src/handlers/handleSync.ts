import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { findClan } from '../database/clan/findClan';
import { embedNoClanConfig } from '../bot/embeds/generalEmbeds';
import { syncClanData } from '../services/memberSync';
import { embedSyncReport } from '../bot/embeds/configEmbeds';
import { syncMissingLastOnline } from '../services/memberSyncNull';

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

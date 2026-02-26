import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { findClan } from '../database/clan/findClan';
import { embedNoClanConfig } from '../bot/embeds/generalEmbeds';
import { syncClanData } from '../services/memberSync';
import { embedSyncReport } from '../bot/embeds/configEmbeds';

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

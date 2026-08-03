import { ChatInputCommandInteraction } from 'discord.js';
import { verifyClanExist } from '../../shared/command-checks/clan-validation';
import { syncClanData, syncMissingLastOnline } from './clan-sync.service';
import { syncReportEmbed } from './clan-sync.embed';
import { errorRunningCommandEmbed } from '../../shared/embeds/general-message';

/**
 * Handle the syncing of the clan members data with the runemetrics hiscores
 */
export async function handleSync(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    //TODO: Need to work on it. Gotta make so it shows up on the embed that this is an ongoing process that will take a few mins.
    // Also might need to make a way so it I cant run this command while this bit is syncing to prevent overload idk. need thinking
    // const lastActivity = interaction.options.getBoolean('activity');
    // if (lastActivity) {
    //   syncMissingLastOnline(clan.id);
    // }

    const report = await syncClanData(clan.id, clan.name);

    const { syncReport } = syncReportEmbed(
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

    await interaction.editReply({
      embeds: [errorRunningCommandEmbed('/config sync')],
    });
  }
}

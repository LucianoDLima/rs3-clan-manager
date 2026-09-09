import { ChatInputCommandInteraction } from 'discord.js';
import { verifyClanExist } from '../../shared/command-checks/clan-validation';
import { errorRunningCommandEmbed } from '../../shared/embeds/general-message';
import { syncByActivity } from './sync-activity.service';
import { finishCommand, isCommandRunning, startCommand } from '../../shared/command-checks/command-lock';

export async function handleSyncActivity(interaction: ChatInputCommandInteraction) {
  const commandName = 'activity';

  if (isCommandRunning(commandName)) {
    return interaction.reply({
      content: 'A sync is already running. Please wait until it finishes.',
      ephemeral: true,
    });
  }

  startCommand(commandName);

  try {
    await interaction.deferReply();

    const clan = await verifyClanExist(interaction);
    if (!clan) return;

    syncByActivity(clan.id);
  } catch (error) {
    console.error(error);

    await interaction.editReply({
      embeds: [errorRunningCommandEmbed('/sync activity')],
    });
  } finally {
    finishCommand(commandName);
  }
}

import { ChatInputCommandInteraction } from 'discord.js';
import { verifyAdminPermissions } from '../../middleware/guard';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'setup') {
    // This is for testing only for now while i work on stuff
    const isAdmin = await verifyAdminPermissions(interaction);
    if (!isAdmin) return;

    await interaction.reply('Setup command received');
  }
}

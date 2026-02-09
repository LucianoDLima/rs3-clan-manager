import { ChatInputCommandInteraction } from 'discord.js';

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === 'setup') {
    await interaction.reply('Setup command received');
  }
}

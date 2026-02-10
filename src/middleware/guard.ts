import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';

export async function verifyAdminPermissions(
  interaction: ChatInputCommandInteraction,
) {
  const isAdmin = interaction.memberPermissions?.has(
    PermissionsBitField.Flags.Administrator,
  );

  if (!isAdmin) {
    const adminMsg = 'You must be an administrator to run this command.';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: adminMsg,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: adminMsg,
        flags: MessageFlags.Ephemeral,
      });
    }

    return false;
  }

  return true;
}


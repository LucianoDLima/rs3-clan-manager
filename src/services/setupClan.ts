import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { Clan } from '@prisma/client';
import { verifyAdminPermissions } from '../middleware/guard';
import { createClan } from '../database/clan/createClan';
import { findClan } from '../database/clan/findClan';
import { embedCons } from '../constants/embeds';

export async function handleSetupClan(interaction: ChatInputCommandInteraction) {
  const isAdmin = await verifyAdminPermissions(interaction);
  if (!isAdmin) return;

  await interaction.deferReply();

  const guildId = interaction.guildId;
  if (!guildId) {
    throw new Error("Interaction doesn't have a guild ID.");
  }

  try {
    const existingClan = await findClan(guildId);
    if (existingClan) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              [
                `This server is already set up with the clan: **${existingClan.name}**.`,
                'If the clan name is incorrect, it will not be able to pull data from the runemetrics.',
                '- You can change the clan name with the `/config rename` command.',
                'Note that changing the clan name should only be done if you changed the clan name in-game and the current name is no longer correct, otherwise you might break the connection to runemetrics and it will stop pulling data.',
              ].join('\n'),
            )
            .setColor(embedCons.color.INFO),
        ],
      });

      return;
    }

    const clan = await handleClanCreation(interaction, guildId);

    const { successEmbed } = buildSuccessEmbed(clan);

    await interaction.editReply({
      embeds: [successEmbed],
    });
  } catch (error) {
    console.error('Error during clan setup:', error);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            'Something went wrong while setting up the clan. Please report this error to the developer and include the timestamp shown below.',
          )
          .setColor(embedCons.color.ERROR)
          .setTimestamp(new Date()),
      ],
    });
  }
}

function handleClanCreation(
  interaction: ChatInputCommandInteraction,
  guildId: string,
) {
  const clanName = interaction.options.getString('clanname', true);

  return createClan(guildId, clanName);
}

function buildSuccessEmbed(clan: Clan) {
  const embedDescription = [`Clan **${clan.name}** has been successfully created!`];

  const successEmbed = new EmbedBuilder()
    .setTitle('Clan created!')
    .setDescription(embedDescription.join('\n'))
    .setColor(embedCons.color.SUCCCESS);

  return { successEmbed };
}

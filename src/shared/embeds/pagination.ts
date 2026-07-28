import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
} from 'discord.js';

export function generatePaginationButtons(page: number, totalPages: number) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('prev_page')
      .setLabel('Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('next_page')
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1),
  );
}

export function handlePagination<T>(
  interaction: ChatInputCommandInteraction,
  message: Message,
  data: T[],
  totalPages: number,
  embedGenerator: (data: T[], page: number) => EmbedBuilder,
) {
  let currentPage = 0;

  // Button will last only 10 mins to prevent bot from breaking if someone interacts with it after the token expires (15mins)
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 600000,
  });

  collector.on('collect', async (i) => {
    const notUser = i.user.id !== interaction.user.id;
    const nextPage = i.customId === 'next_page';
    const prevPage = i.customId === 'prev_page';

    if (notUser) {
      await i.reply({
        content: 'These buttons are not for you.',
        ephemeral: true,
      });
      return;
    }

    if (nextPage) currentPage++;
    if (prevPage) currentPage--;

    await i.update({
      embeds: [embedGenerator(data, currentPage)],
      components: [generatePaginationButtons(currentPage, totalPages)],
    });

  });

  collector.on('end', () => {
    interaction.editReply({ components: [] }).catch(() => {});
  });
}

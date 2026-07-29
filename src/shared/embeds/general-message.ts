import { EmbedBuilder } from 'discord.js';
import { embedCons } from './colors';

export function errorRunningCommandEmbed(command: string) {
  const description = [
    `Something went wrong while running \`${command}\`. Please report this error to the developer with the timestamp shown below.`,
  ];

  const embed = new EmbedBuilder()
    .setTitle(`Error running command \`${command}\``)
    .setDescription(description.join('\n'))
    .setColor(embedCons.color.ERROR)
    .setTimestamp(new Date());

  return embed;
}

import { EmbedBuilder } from 'discord.js';
import { embedCons } from './_util';

export function embedNoClanConfig() {
  const embedDescription = [
    `Make sure an admin runs the \`/config create\` command to create a clan for this server!`,
  ];

  const noClanConfig = new EmbedBuilder()
    .setTitle('No clan configured yet')
    .setDescription(embedDescription.join('\n'))
    .setColor(embedCons.color.INFO);

  return { noClanConfig };
}

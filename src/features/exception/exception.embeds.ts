import { EmbedBuilder } from 'discord.js';
import { embedCons } from '../../bot/embeds/_util';

export function activeMemberNotFoundEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Member Not Found')
    .setDescription(
      `Could not find an active member named **${memberName}** in the clan.`,
    )
    .setColor(embedCons.color.INFO);
}

export function exceptionAddedEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Exception Added')
    .setDescription(`**${memberName}** was added to the exception list.`)
    .setColor(embedCons.color.INFO);
}

export function exceptionMemberNotFoundEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Exception Not Found')
    .setDescription(`**${memberName}** is not in the exception list.`)
    .setColor(embedCons.color.INFO);
}

export function exceptionRemovedEmbed(memberName: string) {
  return new EmbedBuilder()
    .setTitle('Exception Removed')
    .setDescription(`Removed **${memberName}** from the exception list.`)
    .setColor(embedCons.color.INFO);
}

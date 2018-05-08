'use strict';

const cheerio = require('cheerio');
const request = require('snekfetch');

module.exports = async (message) => {
  const url = `https://mdn.io/${message.content
    .split(' ')
    .map((x) => x.trim().toLowerCase())
    .join('-')
    .replace(/[^a-zA-Z0-9]+/g, '-')}`;

  const res = await request.get(url);
  if (!res.ok) {
    await message.reply(`Couldn't fetch "${url}"`);
    return;
  }

  const $ = cheerio.load(res.raw.toString());
  const title = $('head title').text()
    .replace(/\s*-\s*(\w+\s*\w*)\s*\|\s*MDN/gi, (m, type) => {
      if (type === 'Web APIs') {
        return 'DOM';
      }
      return '';
    });

  const text = $('#wikiArticle')
    .first()
    .find('p')
    .first()
    .text() || $('body').text().replace(/\s+/g, ' ');

  if (/did not match any documents|No results containing all your search terms were found/.test(text)) {
    await message.reply('No MDN pages matched your search.');
    return;
  }

  if (!text) {
    await message.reply('Failed to extract MDN text.');
    return;
  }

  let response = `${message.author}, \n**${title.trim()}** (<${url}>)\n\n${text.trim()}`;
  if (response.length > 2000) {
    response = `${response.slice(0, 1995).trim()}…`;
  }
  await message.channel.send(response);
};

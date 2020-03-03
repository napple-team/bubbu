const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.message(/https:\/\/twitter.com/, async ({ message, context }) => {
  const matchPettern = new RegExp('https://twitter.com/[a-zA-Z0-9_]+/status/[0-9]+', 'gi');
  message.text.match(matchPettern).forEach(async (match) => {
    const searchResponse = await app.client.search.messages({
      token: process.env.SLACK_USER_TOKEN,
      query: `in:<#${message.channel}> ${match}`,
    });

    if (searchResponse.messages.total === 0) return;
    // NOTE: 同じアイテムが引っかかることがあるっぽいので除外
    // eslint-disable-next-line max-len
    if (searchResponse.messages.matches.filter((item) => item.ts !== message.ts).length === 0) return;

    await app.client.reactions.add({
      token: context.botToken,
      channel: message.channel,
      name: 'x',
      timestamp: message.ts,
    });
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
})();

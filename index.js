const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.message(/https:\/\/twitter.com/, async ({ message, context, say }) => {
  const matchPettern = new RegExp('https://twitter.com/[a-zA-Z0-9_]+/status/[0-9]+', 'gi');
  const tweetUrls = message.text.match(matchPettern).filter(
    (match, currentIndex, matches) => matches.indexOf(match) === currentIndex
  );
  await Promise.all(tweetUrls.map(async (match) => {
    const searchResponse = await app.client.search.messages({
      token: process.env.SLACK_USER_TOKEN,
      query: `in:<#${message.channel}> ${match}`,
    });

    if (searchResponse.messages.matches.filter((item) => item.ts !== message.ts).length !== 0) {
      try {
        await app.client.reactions.add({
          token: context.botToken,
          channel: message.channel,
          name: 'x',
          timestamp: message.ts,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      if (process.env.GANBARUBY_ENABLE) {
        try {
          await axios.post(`${process.env.GANBARUBY_URL}/save`, { tweetUrl: match }, {
            auth: {
              username: process.env.GANBARUBY_BASIC_USER,
              password: process.env.GANBARUBY_BASIC_PASS,
            }
          });
        } catch (err) {
          await say({
            text: '|c||^.-^|| 画像の保存に失敗しましたわ〜!',
            thread_ts: message.ts
          });
        }
      }
    }
  }));
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
})();

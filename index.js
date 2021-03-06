const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.message(/https:\/\/twitter.com/, async ({ message, context }) => {
  const matchPettern = new RegExp('https://twitter.com/[a-zA-Z0-9_]+/status/[0-9]+', 'gi');
  message.text.match(matchPettern).filter(
    (match, currentIndex, matches) => matches.indexOf(match) === currentIndex
  ).forEach(async (match) => {
    const searchResponse = await app.client.search.messages({
      token: process.env.SLACK_USER_TOKEN,
      query: `in:<#${message.channel}> ${match}`,
    });

    if (searchResponse.messages.matches.filter((item) => item.ts !== message.ts).length !== 0) {
      await app.client.reactions.add({
        token: context.botToken,
        channel: message.channel,
        name: 'x',
        timestamp: message.ts,
      });
    } else {
      if ( !!process.env.GANBARUBY_ENABLE ) {
        await axios.post(`${process.env.GANBARUBY_URL}/post`, { tweetUrl: match }, {
          auth: {
            username: process.env.GANBARUBY_BASIC_USER,
            password: process.env.GANBARUBY_BASIC_PASS,
          }
        })
      }
    }
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
})();

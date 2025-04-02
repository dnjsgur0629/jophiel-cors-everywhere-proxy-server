import { BLACK_LIST, HOST, PORT, WHITE_LIST } from './config/index.js'
import { createRateLimitChecker, createServer } from './lib/index.js'

createServer({
  originBlacklist: BLACK_LIST,
  originWhitelist: WHITE_LIST,
  requireHeader: ['origin', 'x-requested-with'],
  checkRateLimit: createRateLimitChecker(100, 1),
  removeHeaders: [
    'cookie',
    'cookie2',
    // Strip Heroku-specific headers
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
    // Other Heroku added debug headers
    // 'x-forwarded-for',
    // 'x-forwarded-proto',
    // 'x-forwarded-port',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
    xfwd: false,
  },
}).listen(PORT, HOST, () => {
  console.log(`Running CORS Anywhere on ${HOST}:${PORT}`)
})

/* eslint-env mocha */
import http from 'http'
import path from 'path'
import url from 'url'
import child_process from 'child_process'
import { getDirName } from '../lib/getDirName.js'

// Run this specific test using:
// npm test -- -f memory
const fork = child_process.fork

describe('memory usage', () => {
  let cors_api_url

  let server
  let cors_anywhere_child
  before((done) => {
    server = http
      .createServer((req, res) => {
        res.writeHead(200)
        res.end()
      })
      .listen(0, () => {
        done()
      })
  })

  after((done) => {
    server.close(() => {
      done()
    })
  })

  beforeEach((done) => {
    const cors_module_path = path.join(getDirName(), 'child')
    const args = []
    // Uncomment this if you want to compare the performance of CORS Anywhere
    // with the standard no-op http module.
    // args.push('use-http-instead-of-cors-anywhere');
    const nodeOptionsArgs = ['--expose-gc']
    const nodeMajorV = parseInt(process.versions.node, 10)
    // Node 11.3.0+, 10.14.0+, 8.14.0+, 6.15.0+ restrict header sizes
    // (CVE-2018-12121), and need to be passed the --max-http-header-size flag
    // to not reject large headers.
    if (nodeMajorV >= 11 || nodeMajorV === 10 || nodeMajorV === 8 || nodeMajorV === 6) {
      nodeOptionsArgs.push('--max-http-header-size=60000')
    }
    cors_anywhere_child = fork(cors_module_path, args, {
      execArgv: nodeOptionsArgs,
    })
    cors_anywhere_child.once('message', (cors_url) => {
      cors_api_url = cors_url
      done()
    })
  })

  afterEach(() => {
    cors_anywhere_child.kill()
  })

  /**
   * Perform N CORS Anywhere proxy requests to a simple test server.
   *
   * @param {number} n - number of repetitions.
   * @param {number} requestSize - Approximate size of request in kilobytes.
   * @param {number} memMax - Expected maximum memory usage in kilobytes.
   * @param {function} done - Upon success, called without arguments.
   *   Upon failure, called with the error as parameter.
   */
  const performNRequests = (n, requestSize, memMax, done) => {
    let remaining = n
    const request = url.parse(cors_api_url + 'http://127.0.0.1:' + server.address().port)
    request.agent = false // Force Connection: Close
    request.headers = {
      'Long-header': new Array(requestSize * 1e3).join('x'),
    }(() => {
      if (remaining-- === 0) {
        cors_anywhere_child.once('message', (memory_usage_delta) => {
          console.log(
            'Memory usage delta: ' +
              memory_usage_delta +
              ' (' +
              n +
              ' requests of ' +
              requestSize +
              ' kb each)'
          )
          if (memory_usage_delta > memMax * 1e3) {
            // Note: Even if this error is reached, always profile (e.g. using
            // node-inspector) whether it is a true leak, and not e.g. noise
            // caused by the implementation of V8/Node.js.
            // Uncomment args.push('use-http-instead-of-cors-anywhere') at the
            // fork() call to get a sense of what's normal.
            throw new Error(
              'Possible memory leak: ' +
                memory_usage_delta +
                ' bytes was not released, which exceeds the ' +
                memMax +
                ' kb limit by ' +
                Math.round(memory_usage_delta / memMax / 10 - 100) +
                '%.'
            )
          }
          done()
        })
        cors_anywhere_child.send(null)
        return
      }
      http
        .request(request, () => {
          requestAgain()
        })
        .on('error', (error) => {
          done(error)
        })
        .end()
    })()
  }

  it('100 GET requests 50k', (done) => {
    // This test is just for comparison with the following tests.
    performNRequests(100, 50, 1200, done)
  })

  // 100x 1k and 100x 50k for comparison.
  // Both should use about the same amount of memory if there is no leak.
  it('1000 GET requests 1k', function (done) {
    // Every request should complete within 10ms.
    this.timeout(1000 * 10)
    performNRequests(1000, 1, 2000, done)
  })
  it('1000 GET requests 50k', function (done) {
    // Every request should complete within 10ms.
    this.timeout(1000 * 10)
    performNRequests(1000, 50, 2000, done)
  })
})

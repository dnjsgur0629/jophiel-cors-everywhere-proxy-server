# Ratatoskr
클라이언트가 어떤 요청을 보내고자할 때 프록시 역할을 하여 `Access to fetch at ‘<some domain>’ from origin ‘<my domain>’ has been blocked by CORS policy` 에러를 회피할 수 있게 합니다.

## 프로젝트 이름의 유래 
**Ratatoskr**는 북유럽 신화에서 **Yggdrasil**을 오르내리며 꼭대기의 흐르스벨그와 뿌리의 니드호그 사이에서 말을 전달하는 다람쥐입니다.

본래 서로 소통할 수 없는 존재들끼리의 소통을 가능케 한다는 의미에서 `Ratatoskr`라는 이름을 채택했습니다.

## 허용, 제외할 도메인
`domainList.yaml` 파일에서 허용할 도메인을 편집할 수 있습니다.
- WHITE_LIST: 설정된 경우 WHITE_LIST에 포함되지 않은 출처의 요청은 차단됩니다. 이 목록이 비어 있으면 모든 출처가 허용됩니다.
- BLACK_LIST: 설정된 경우 BLACK_LIST에 포함된 출처의 요청은 차단됩니다.
## aws cli를 통한 프로필 설정
`aws cli`를 설치하고 `aws configure --profile <profile-name>` 명령으로 프로필을 설정합니다.

`aws cli V2` 이상 버전에서 `aws configure list-profiles` 명령으로 설정된 프로필 리스트를 확인 할 수 있습니다.
버전이 낮아 해당 명령을 사용할 수 없으면 `~/.aws/credentials` 또는 `~/.aws/config`를 직접 확인할 수 있습니다.

## 이미지 빌드 후 ECR에 푸쉬
`build_and_push.zsh`에서 `PROFILE`을 본인이 설정한 프포필 이름으로 변경합니다.

아래 명령을 터미널에 입력하여 이미지를 빌드하고 ECR에 푸쉬합니다.
- development (sandbox) 환경: `npm run deploy`
- production 환경: `npm run deploy:prod`

## 요청 예시
* `<proxy server origin>/http://google.com/` - Google.com with CORS headers


## Documentation

### Server

The module exports `createServer(options)`, which creates a server that handles
proxy requests. The following options are supported:

* function `getProxyForUrl` - If set, specifies which intermediate proxy to use for a given URL.
  If the return value is void, a direct request is sent. The default implementation is
  [`proxy-from-env`](https://github.com/Rob--W/proxy-from-env), which respects the standard proxy
  environment constiables (e.g. `https_proxy`, `no_proxy`, etc.).
* array of strings `originBlacklist` - If set, requests whose origin is listed are blocked.  
  Example: `['https://bad.example.com', 'http://bad.example.com']`
* array of strings `originWhitelist` - If set, requests whose origin is not listed are blocked.  
  If this list is empty, all origins are allowed.
  Example: `['https://good.example.com', 'http://good.example.com']`
* function `handleInitialRequest` - If set, it is called with the request, response and a parsed
  URL of the requested destination (null if unavailable). If the function returns true, the request
  will not be handled further. Then the function is responsible for handling the request.
  This feature can be used to passively monitor requests, for example for logging (return false).
* function `checkRateLimit` - If set, it is called with the origin (string) of the request. If this
  function returns a non-empty string, the request is rejected and the string is send to the client.
* boolean `redirectSameOrigin` - If true, requests to URLs from the same origin will not be proxied but redirected.
  The primary purpose for this option is to save server resources by delegating the request to the client
  (since same-origin requests should always succeed, even without proxying).
* array of strings `requireHeader` - If set, the request must include this header or the API will refuse to proxy.  
  Recommended if you want to prevent users from using the proxy for normal browsing.  
  Example: `['Origin', 'X-Requested-With']`.
* array of lowercase strings `removeHeaders` - Exclude certain headers from being included in the request.  
  Example: `["cookie"]`
* dictionary of lowercase strings `setHeaders` - Set headers for the request (overwrites existing ones).  
  Example: `{"x-powered-by": "CORS Anywhere"}`
* number `corsMaxAge` - If set, an Access-Control-Max-Age request header with this value (in seconds) will be added.  
  Example: `600` - Allow CORS preflight request to be cached by the browser for 10 minutes.
* string `helpFile` - Set the help file (shown at the homepage).  
  Example: `"myCustomHelpText.txt"`

For advanced users, the following options are also provided.

* `httpProxyOptions` - Under the hood, [http-proxy](https://github.com/nodejitsu/node-http-proxy)
  is used to proxy requests. Use this option if you really need to pass options
  to http-proxy. The documentation for these options can be found [here](https://github.com/nodejitsu/node-http-proxy#options).
* `httpsOptions` - If set, a `https.Server` will be created. The given options are passed to the
  [`https.createServer`](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) method.

For even more advanced usage (building upon CORS Anywhere),
see the sample code in [test/test-examples.js](test/test-examples.js).

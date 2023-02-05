module.exports = async function makeIndexFetch (opts = {}) {
  const { makeRoutedFetch } = await import('make-fetch')
  const {fetch, router} = makeRoutedFetch()
  const {got} = await import('got')
  const detect = require('detect-port')
  const HttpProxyAgent = require('http-proxy-agent').HttpProxyAgent
  const HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent
  const finalOpts = { timeout: 30000, ...opts }
  const mainConfig = {ip: 'localhost', port: 8077}
  const useTimeOut = finalOpts.timeout

  function takeCareOfIt(data){
    console.log(data)
    throw new Error('aborted')
  }

  function sendTheData(theSignal, theData){
    if(theSignal){
      theSignal.removeEventListener('abort', takeCareOfIt)
    }
    return theData
  }

  async function handleOui(request) {
    const { url, method, headers: reqHeaders, body, signal, referrer } = request

    if(signal){
      signal.addEventListener('abort', takeCareOfIt)
    }
      if ((!request.url.startsWith('oui:') && !request.url.startsWith('ouis:')) || !request.method) {
        throw new Error(`request is not correct, protocol must be oui:// or ouis://, or requires a method`)
      }

      if(mainURL.hostname === '_'){
        const detectedPort = await detect(mainConfig.port)
        const isItRunning = mainConfig.port !== detectedPort
        return {status: 200, headers: {'Content-Type': 'text/plain; charset=utf-8'}, body: [String(isItRunning)]}
      }

      request.url = request.url.replace('oui', 'http')

      request.timeout = {request: (request.headers['x-timer'] && request.headers['x-timer'] !== '0') || (mainURL.searchParams.has('x-timer') && mainURL.searchParams.get('x-timer') !== '0') ? Number(request.headers['x-timer'] || mainURL.searchParams.get('x-timer')) * 1000 : useTimeOut}
      request.agent = { 'http': new HttpProxyAgent(`http://${mainConfig.ip}:${mainConfig.port}`), 'https': new HttpsProxyAgent(`http://${mainConfig.ip}:${mainConfig.port}`) }

      delete request.referrer
      if(request.method === 'CONNECT' || request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS' || request.method === 'TRACE'){
        delete request.body
      }
      if(!request.signal){
        delete request.signal
      }

      const res = await got(request)
      return sendTheData(signal, {status: res.statusCode, headers: res.headers, body: [res.body]})
  }

  async function handleOuis(request) {
    const { url, method, headers: reqHeaders, body, signal, referrer } = request

    if(signal){
      signal.addEventListener('abort', takeCareOfIt)
    }
      if ((!request.url.startsWith('oui:') && !request.url.startsWith('ouis:')) || !request.method) {
        throw new Error(`request is not correct, protocol must be oui:// or ouis://, or requires a method`)
      }

      if(mainURL.hostname === '_'){
        const detectedPort = await detect(mainConfig.port)
        const isItRunning = mainConfig.port !== detectedPort
        return {status: 200, headers: {'Content-Type': 'text/plain; charset=utf-8'}, body: [String(isItRunning)]}
      }

      request.url = request.url.replace('oui', 'http')

      request.timeout = {request: (request.headers['x-timer'] && request.headers['x-timer'] !== '0') || (mainURL.searchParams.has('x-timer') && mainURL.searchParams.get('x-timer') !== '0') ? Number(request.headers['x-timer'] || mainURL.searchParams.get('x-timer')) * 1000 : useTimeOut}
      request.agent = { 'http': new HttpProxyAgent(`http://${mainConfig.ip}:${mainConfig.port}`), 'https': new HttpsProxyAgent(`http://${mainConfig.ip}:${mainConfig.port}`) }

      delete request.referrer
      if(request.method === 'CONNECT' || request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS' || request.method === 'TRACE'){
        delete request.body
      }
      if(!request.signal){
        delete request.signal
      }

    const res = await got(request)
    return sendTheData(signal, {status: res.statusCode, headers: res.headers, body: [res.body]})
  }
  router.any('oui://*/**', handleOui)
  router.any('ouis://*/**', handleOuis)

  return fetch
}
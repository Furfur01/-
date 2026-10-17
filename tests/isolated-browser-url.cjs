// Browser tests must explicitly select a server with its own save and session.
module.exports=async function isolatedBrowserUrl(value=process.env.UNIVERSE_TEST_URL){
  if(!value)throw Error('Set UNIVERSE_TEST_URL to an isolated game server using EMPIRE_SAVE_FILE');
  const url=new URL(value);
  if(url.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||url.port==='8289'||url.pathname!=='/'||url.search||url.hash)throw Error('Browser tests require a separate local port');
  const response=await fetch(new URL('/api/health',url),{signal:AbortSignal.timeout(3000)});
  const health=await response.json();
  if(!response.ok||health.service!=='galaxy-empire'||health.isolated!==true)throw Error('Browser tests cannot use the personal save');
  return url.origin;
};

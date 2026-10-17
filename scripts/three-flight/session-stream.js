// EventSource cannot attach the local-session header used by the desktop UI.
// Keep streaming snapshots, including named finish events, without relying on cookies.
export class SessionStream extends EventTarget {
  constructor(url) {
    super();this.url=url;this.closed=false;this.readyState=0;this.connect();
  }
  async connect() {
    if(this.closed)return;this.readyState=0;this.abort=new AbortController();
    try {
      const response=await fetch(this.url,{credentials:'same-origin',cache:'no-store',headers:{'X-Empire-Client':'galactic-command',Accept:'text/event-stream'},signal:this.abort.signal});
      if(!response.ok)throw Error('战场连接失败：'+response.status);
      if(this.closed)return;this.readyState=1;
      const reader=response.body.getReader(),decoder=new TextDecoder();let pending='',type='',data=[];
      while(!this.closed){
        const chunk=await reader.read();if(chunk.done)break;
        pending+=decoder.decode(chunk.value,{stream:true});
        let end;
        while((end=pending.indexOf('\n'))!==-1){
          const line=pending.slice(0,end).replace(/\r$/,'');pending=pending.slice(end+1);
          if(line===''){
            if(data.length){const event=new MessageEvent(type||'message',{data:data.join('\n')});this.dispatchEvent(event);if(event.type==='message')this.onmessage?.(event);}
            type='';data=[];if(this.closed)break;
          }else if(line.startsWith('event:'))type=line.slice(6).trim();
          else if(line.startsWith('data:'))data.push(line.slice(5).replace(/^ /,''));
        }
      }
    }catch(error){if(this.closed)return;this.readyState=0;this.onerror?.(error);}
    if(!this.closed){this.readyState=0;this.retry=setTimeout(()=>this.connect(),1500);}
  }
  close(){this.closed=true;this.readyState=2;clearTimeout(this.retry);this.abort?.abort();}
}

'use strict';

// All data is authored for teaching. No requests, sockets or upstream calls are made.
const SOURCE = 'https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/';
const scenarioData = {
  http: {name:'明文 HTTP', steps:[
    ['包装启动目标程序','应用在 seccomp 过滤器覆盖下启动。示例：后端向外部服务发送普通 HTTP 请求。','此时尚未形成请求记录。','cmd/run/run.go'],
    ['接管连接，而不是修改业务代码','socket / connect 等选定调用进入用户通知处理器，Subtrace 将应用连接与外部连接接入本地代理。','应用 ⇄ 本地代理 ⇄ 外部服务','cmd/run/socket/socket.go'],
    ['从字节识别 HTTP','代理观察流量开头，识别 HTTP/1 或 HTTP/2，然后按对应协议处理请求与响应。','这里没有 TLS，不需要解密。','cmd/run/socket/proxy.go'],
    ['整理为一条观察记录','解析方法、URL、头部与正文采样，整理 HAR 与耗时信息。正文上限只限制捕获副本。','可观察：请求 / 响应头部、正文、状态和耗时。','tracer/parser.go'],
    ['过滤后交给展示通道','按 CEL 规则决定记录是否保留，默认向 Subtrace 服务发布；另有本地 DevTools 路径。','有 HTTP 记录；不包含业务函数内部调用栈。','tracer/parser.go']
  ]},
  outgoing: {name:'出站 HTTPS', steps:[
    ['为出站 TLS 准备临时 CA','启动时生成内存 CA。应用读取已知证书集合时，拦截器提供“原证书集合 + 临时 CA”的内存文件。读取可能早于连接。','不覆盖磁盘证书；依赖应用信任库兼容。','cmd/run/engine/process/handle.go'],
    ['将加密连接接入代理','目标程序的 TCP 连接经系统调用处理接入代理，代理再连接真正的 HTTPS 服务。','此时仍然是加密流量，尚无 HTTP 正文。','cmd/run/socket/socket.go'],
    ['建立两段 TLS 通道','代理向外部服务发起 TLS 握手，并向应用提供临时 CA 签发的站点证书。应用接受它后，两段通道才能建立。','应用 ⇄ TLS A ⇄ 代理内明文 ⇄ TLS B ⇄ 外部服务','cmd/run/tls/tls.go'],
    ['解析代理中的 HTTP 明文','在 TLS 处理后的流上继续识别 HTTP/1 或 HTTP/2，采样请求、响应并生成 HAR。','信任兼容时，出站 HTTPS 可以形成 HTTP 记录。','cmd/run/socket/proxy.go'],
    ['记录可见，信任语义有变化','此版本上游 TLS 使用 InsecureSkipVerify，源码保留证书验证 TODO；不能认为中间人拦截与原程序的信任校验完全等价。','教学结论：可解析，但需核对信任机制与运行兼容性。','cmd/run/tls/tls.go',true]
  ]},
  incoming: {name:'入站 TLS', steps:[
    ['请求直接以 TLS 到达应用','这里假设应用自己终止 HTTPS，前面没有网关替它解密。与“网关转发明文 HTTP”是不同情境。','外部客户端 → TLS → 目标应用','cmd/run/socket/proxy.go'],
    ['代理接入入站连接','listen / accept 等路径让入站 TCP 经过代理。连接被接入，并不代表里面的加密内容已经可读。','接管 TCP ≠ 自动解密 TLS。','cmd/run/socket/socket.go'],
    ['识别为入站 TLS','proxyTLS 检查连接方向。应用服务证书和私钥的位置不统一，当前实现没有这条入站解密路径。','当前代码直接回退到原始字节转发。','cmd/run/socket/proxy.go',true],
    ['密文继续传输','代理转发双方字节，HTTP 内容仍封装在应用与客户端的 TLS 中。','不会产生这段通道的明文 HTTP 详情。','cmd/run/socket/proxy.go',true],
    ['在正确的位置观察','如果网关先终止 TLS，再向被观察应用转发 HTTP，可以观察那段明文链路；这不等于 Subtrace 解开了入站 TLS。','结论：本情境只能转发，不能展示 HTTP 正文。','cmd/run/socket/proxy.go',true]
  ]},
  pinning: {name:'证书固定', steps:[
    ['应用额外固定证书或公钥','程序除了常规 CA 信任，还要求服务端证书或公钥与预期值一致。这是固定证书的教学情境。','临时 CA 被加入信任库，也未必满足固定校验。','cmd/run/socket/proxy.go'],
    ['出站连接接入代理','网络连接仍可被接管。Subtrace 准备使用临时 CA 签发证书以终止应用侧 TLS。','网络接管成功，不代表后续握手成功。','cmd/run/socket/socket.go'],
    ['示例应用拒绝代理证书','本情境中应用发现证书或公钥不符合固定值，拒绝临时签发证书，TLS 握手失败。','这是可能导致业务请求失败的兼容问题。','cmd/run/socket/proxy.go',true],
    ['没有可解析的 HTTP 响应','握手未建立，代理不能获得该次通信的 HTTP 请求 / 响应对。这里不假定源码会自动重试原始连接。','没有 HTTP 状态码不等于一定收到 500。','cmd/run/tls/tls.go',true],
    ['关闭拦截的取舍','SUBTRACE_TLS=false 可关闭 TLS 拦截，使加密连接走转发路径；代价是无法查看通道内的 HTTP 正文。具体应用仍需实测。','结论：证书固定可能失败；关闭拦截会失去明文可见性。','docs/env-vars.mdx',true]
  ]},
  tcp: {name:'未知 TCP', steps:[
    ['应用使用其他 TCP 协议','本情境是代理不能识别的 TCP 数据流，不预设它符合 HTTP 的请求与响应格式。','这是协议边界示例，不是数据库调试演示。','cmd/run/socket/proxy.go'],
    ['TCP 连接仍可接入','IPv4 / IPv6 的 TCP 流式连接进入代理。是否能传输与是否能理解业务内容是两个问题。','TCP 可转发，不代表具有应用层解释能力。','cmd/run/engine/process/handle.go'],
    ['协议识别没有命中','开头字节未识别为 HTTP/1、HTTP/2 或可处理的 TLS，代理使用 fallback 路径。','不会硬把未知字节解释成 HTTP。','cmd/run/socket/proxy.go'],
    ['双向复制原始字节','双方数据由原始转发路径继续传输，不生成 HTTP 头部、正文、状态码等详情。','行为是转发，不是生成数据库查询分析。','cmd/run/socket/proxy.go'],
    ['限定观察范围','未知 TCP 缺少 HTTP 语义；UDP / QUIC / HTTP/3 也不属于这条 TCP 捕获路径。','结论：不要把网络接管理解成全协议分析。','cmd/run/engine/process/handle.go',true]
  ]}
};

let scenario = 'http';
let step = 0;
const find = id => document.getElementById(id);
function renderStep(){
  const current = scenarioData[scenario];
  const [title, description, outcome, source, warning] = current.steps[step];
  find('scenario-name').textContent = current.name;
  find('step-count').textContent = `${String(step+1).padStart(2,'0')} / 05`;
  find('phase-label').textContent = `STEP ${String(step+1).padStart(2,'0')}`;
  find('phase-title').textContent = title;
  find('phase-description').textContent = description;
  find('phase-outcome').textContent = outcome;
  find('phase-outcome').classList.toggle('warning',Boolean(warning));
  find('phase-source').href = SOURCE + source;
  document.querySelectorAll('.stages li').forEach((el,i)=>{
    el.classList.toggle('active',i===step);el.classList.toggle('done',i<step);
    if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-scenario]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.scenario===scenario)));
  find('previous').disabled = step===0;
  find('next').disabled = step===4;
  find('next').textContent = step===4?'已到最后一步':'下一步 →';
}
document.querySelectorAll('[data-scenario]').forEach(el=>el.addEventListener('click',()=>{scenario=el.dataset.scenario;step=0;renderStep();}));
find('previous').addEventListener('click',()=>{step=Math.max(0,step-1);renderStep();});
find('next').addEventListener('click',()=>{step=Math.min(4,step+1);renderStep();});
find('restart').addEventListener('click',()=>{step=0;renderStep();});

const records = [
  {id:'orders',method:'POST',path:'/v1/orders',status:201,time:128,direction:'出站 HTTPS',request:JSON.stringify({item:'book',quantity:2},null,2),response:JSON.stringify({id:'demo_order_001',status:'created',message:'订单已创建；这是教学样例，不会真实下单。'},null,2),headers:'请求头（样例）\nContent-Type: application/json\nX-Demo: static-example\n\n响应头（样例）\nContent-Type: application/json\nX-Request-Id: demo-order-001'},
  {id:'profile',method:'GET',path:'/v1/profile',status:401,time:42,direction:'出站 HTTPS',request:'',response:JSON.stringify({error:'unauthorized',message:'凭据缺失，请检查请求头。'},null,2),headers:'请求头（样例）\nAccept: application/json\nAuthorization: （未发送）\n\n响应头（样例）\nContent-Type: application/json\nWWW-Authenticate: Bearer'},
  {id:'health',method:'GET',path:'/health',status:200,time:3,direction:'入站 HTTP',request:'',response:JSON.stringify({status:'ok'},null,2),headers:'请求头（样例）\nUser-Agent: example-health-check\n\n响应头（样例）\nContent-Type: application/json'},
  {id:'search',method:'GET',path:'/v1/search?q=demo',status:503,time:210,direction:'出站 HTTPS',request:'',response:JSON.stringify({error:'service_unavailable',message:'示例上游暂不可用。'},null,2),headers:'请求头（样例）\nAccept: application/json\n\n响应头（样例）\nContent-Type: application/json\nRetry-After: 30'}
];
let selected = 'orders';
let panel = 'response';
function matchingRecords(){
  const query=find('search').value.trim().toLowerCase();
  const filter=find('filter').value;
  return records.filter(r=>r.path.toLowerCase().includes(query)&&(filter!=='errors'||r.status>=400)&&(filter!=='health'||r.path!=='/health'));
}
// Preserve UTF-8 character boundaries while enforcing the captured-byte limit.
function capture(text,limit){
  const encoder=new TextEncoder();
  let used=0;let output='';
  for(const character of text){const size=encoder.encode(character).length;if(used+size>limit)break;output+=character;used+=size;}
  return {text:output,used,total:encoder.encode(text).length};
}
function renderDetail(){
  const record=matchingRecords().find(r=>r.id===selected);
  find('record-content').hidden=!record;
  find('no-selection').hidden=Boolean(record);
  if(!record)return;
  find('record-path').textContent=record.path;
  find('record-status').textContent=record.status;
  find('record-status').classList.toggle('error',record.status>=400);
  find('record-meta').replaceChildren();
  [record.method,record.direction,`${record.time} ms · 虚构耗时`].forEach(value=>{const span=document.createElement('span');span.textContent=value;find('record-meta').append(span);});
  document.querySelectorAll('[data-panel]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.panel===panel)));
  if(panel==='headers'){
    find('record-body').textContent=record.headers;
    find('capture-note').textContent='头部为固定样例。正文上限只作用于请求与响应正文示例，不截断这里的头部。';
  }else{
    const result=capture(record[panel],Number(find('payload-limit').value));
    find('record-body').textContent=result.text||'（此请求无正文）';
    find('capture-note').textContent=result.total>result.used?`显示 ${result.used} / ${result.total} 字节 · 捕获副本已截断，真实传输不受这个上限裁剪。`:`显示 ${result.used} / ${result.total} 字节 · 完整样例正文；不是实际捕获结果。`;
  }
}
function renderRecords(){
  const visible=matchingRecords();
  if(!visible.some(r=>r.id===selected))selected=visible[0]?.id||null;
  find('requests').replaceChildren();
  visible.forEach(record=>{
    const button=document.createElement('button');button.className='request-row';button.dataset.record=record.id;button.setAttribute('aria-pressed',String(selected===record.id));
    const method=document.createElement('span');method.className='method';method.textContent=record.method;
    const info=document.createElement('span');info.className='path-info';
    const path=document.createElement('strong');path.textContent=record.path;
    const description=document.createElement('small');description.textContent=`${record.direction} · ${record.time} ms（样例）`;info.append(path,description);
    const status=document.createElement('span');status.className=`status${record.status>=400?' error':''}`;status.textContent=record.status;
    button.append(method,info,status);button.addEventListener('click',()=>{selected=record.id;renderRecords();find('requests').querySelector(`[data-record="${record.id}"]`).focus({preventScroll:true});});find('requests').append(button);
  });
  find('result-count').textContent=`${visible.length} 条样例`;
  find('empty').hidden=visible.length>0;
  renderDetail();
}
find('search').addEventListener('input',renderRecords);
find('filter').addEventListener('change',renderRecords);
find('payload-limit').addEventListener('change',renderDetail);
document.querySelectorAll('[data-panel]').forEach(el=>el.addEventListener('click',()=>{panel=el.dataset.panel;renderDetail();}));
find('clear-search').addEventListener('click',()=>{find('search').value='';find('filter').value='all';renderRecords();find('search').focus();});
renderStep();renderRecords();
document.querySelectorAll('.interactive').forEach(el=>{el.hidden=false;});

const CDP = 'http://127.0.0.1:9222';

async function main() {
  const res = await fetch(`${CDP}/json/new?${encodeURIComponent('http://localhost:3000/')}`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (m, p) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) pending.get(m.id)(m.result); };
  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('WebAuthn.enable');
  const { authenticatorId } = await send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true },
  });

  const ev = async (expression) => {
    const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (out.exceptionDetails) return 'ERR: ' + (out.exceptionDetails.exception?.description || out.exceptionDetails.text);
    return out.result.value;
  };
  const state = () => ev(`JSON.stringify({path:location.pathname, overlay:!!document.querySelector('.fixed.inset-0.z-50'), body:document.body.innerText.replace(/\\n/g,' | ').slice(0,180)})`);

  await new Promise((r) => setTimeout(r, 3500));

  await ev(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open Workspace')).click()`);
  await new Promise((r) => setTimeout(r, 900));
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create a workspace'))?.click()`);
  await new Promise((r) => setTimeout(r, 700));
  await ev(`(()=>{const i=document.querySelector('input');const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(i,'studio-north');i.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await new Promise((r) => setTimeout(r, 400));
  console.log('typed value:', await ev(`document.querySelector('input')?.value`));

  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create passkey'))?.click()`);
  await new Promise((r) => setTimeout(r, 6000));
  console.log('after register:', await state());
  console.log('creds on device:', (await send('WebAuthn.getCredentials', { authenticatorId })).credentials.length);

  ws.close();
  await fetch(`${CDP}/json/close/${target.id}`);
}
main().catch((e) => { console.error(e); process.exit(1); });

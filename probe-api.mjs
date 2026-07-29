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
  await send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true },
  });

  const ev = async (expression) => {
    const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (out.exceptionDetails) return 'ERR: ' + (out.exceptionDetails.exception?.description || out.exceptionDetails.text);
    return out.result.value;
  };

  await new Promise((r) => setTimeout(r, 3500));

  await ev(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open Workspace')).click()`);
  await new Promise((r) => setTimeout(r, 800));
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create a workspace'))?.click()`);
  await new Promise((r) => setTimeout(r, 500));
  await ev(`(()=>{const i=document.querySelector('input');const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(i,'studio-north');i.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await new Promise((r) => setTimeout(r, 300));
  console.log('input value in React:', await ev(`document.querySelector('input').value`));

  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create passkey'))?.click()`);
  await new Promise((r) => setTimeout(r, 4000));

  // Dump the whole modal so the error line is visible
  console.log('modal text:', await ev(`document.querySelector('.rounded-\\\\[2rem\\\\]')?.innerText.replace(/\\n/g,' | ') ?? 'MODAL GONE'`));
  console.log('path:', await ev(`location.pathname`));

  ws.close();
  await fetch(`${CDP}/json/close/${target.id}`);
}
main().catch((e) => { console.error(e); process.exit(1); });

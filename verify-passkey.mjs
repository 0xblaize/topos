import { writeFileSync } from 'node:fs';
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
  const path = () => ev(`location.pathname`);
  const type = (v) => ev(`(()=>{const i=document.querySelector('input');const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(i,'${v}');i.dispatchEvent(new Event('input',{bubbles:true}));})()`);

  await new Promise((r) => setTimeout(r, 3500));

  // 1. Register
  await ev(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open Workspace')).click()`);
  await new Promise((r) => setTimeout(r, 800));
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create a workspace'))?.click()`);
  await new Promise((r) => setTimeout(r, 600));
  await type('studio-north');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create passkey'))?.click()`);
  await new Promise((r) => setTimeout(r, 6000));
  console.log('1. registered ->', await path());

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('C:/Users/USER/topos/verify-dashboard.png', Buffer.from(shot.data, 'base64'));

  // 2. Sign out
  await ev(`document.querySelector('button[aria-label="Sign out"]')?.click()`);
  await new Promise((r) => setTimeout(r, 3500));
  console.log('2. signed out ->', await path());

  // 3. Direct dashboard access after logout should bounce
  await ev(`location.href='/dashboard'`);
  await new Promise((r) => setTimeout(r, 3500));
  console.log('3. /dashboard while logged out ->', await path());

  // 4. Sign back in with the SAME passkey
  await new Promise((r) => setTimeout(r, 1500));
  await ev(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open Workspace'))?.click()`);
  await new Promise((r) => setTimeout(r, 900));
  await type('studio-north');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue with passkey'))?.click()`);
  await new Promise((r) => setTimeout(r, 6000));
  console.log('4. signed back in ->', await path());

  // 5. Probe: sign in as a name with no passkey
  await ev(`document.querySelector('button[aria-label="Sign out"]')?.click()`);
  await new Promise((r) => setTimeout(r, 3500));
  await ev(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open Workspace'))?.click()`);
  await new Promise((r) => setTimeout(r, 900));
  await type('ghost-user');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue with passkey'))?.click()`);
  await new Promise((r) => setTimeout(r, 3000));
  console.log('5. unknown user error ->', await ev(`[...document.querySelectorAll('p')].map(p=>p.textContent).find(t=>t.includes('passkey registered')) ?? 'NO ERROR SHOWN'`), '| path:', await path());

  // 6. Probe: empty username
  await type('');
  await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue with passkey'))?.click()`);
  await new Promise((r) => setTimeout(r, 1200));
  console.log('6. empty name error ->', await ev(`[...document.querySelectorAll('p')].map(p=>p.textContent).find(t=>t.includes('workspace name')) ?? 'NO ERROR SHOWN'`));

  ws.close();
  await fetch(`${CDP}/json/close/${target.id}`);
}
main().catch((e) => { console.error(e); process.exit(1); });

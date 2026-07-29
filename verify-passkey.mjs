import { writeFileSync } from 'node:fs';

const CDP = 'http://127.0.0.1:9222';

async function main() {
  const res = await fetch(`${CDP}/json/new?${encodeURIComponent('http://localhost:3000/')}`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const logs = [];
  const send = (method, params, sessionId) => new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      logs.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
    }
    if (m.method === 'Runtime.exceptionThrown') logs.push(m.params.exceptionDetails.text);
    if (m.id && pending.has(m.id)) pending.get(m.id)(m.result);
  };
  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Page.enable');

  // Virtual authenticator = real WebAuthn ceremony, no physical device.
  await send('WebAuthn.enable');
  const { authenticatorId } = await send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true },
  });
  console.log('virtual authenticator:', authenticatorId);

  const evalJs = async (expression) => {
    const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (out.exceptionDetails) return { __error: out.exceptionDetails.exception?.description || out.exceptionDetails.text };
    return out.result.value;
  };

  await new Promise((r) => setTimeout(r, 3500));

  // Open modal via the navbar button
  console.log('1. open modal:', await evalJs(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open Workspace'));if(!b)return 'BUTTON NOT FOUND';b.click();return 'clicked'})()`));
  await new Promise((r) => setTimeout(r, 900));
  console.log('   modal visible:', await evalJs(`!!document.querySelector('input[placeholder="studio-north"]')`));

  // Switch to create mode, type name, submit
  await evalJs(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create a workspace'))?.click()`);
  await new Promise((r) => setTimeout(r, 600));
  await evalJs(`(()=>{const i=document.querySelector('input');const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(i,'studio-north');i.dispatchEvent(new Event('input',{bubbles:true}));return i.value})()`);
  console.log('2. typed username');

  console.log('3. create passkey:', await evalJs(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Create passkey'))?.click() ?? 'clicked'`));
  await new Promise((r) => setTimeout(r, 5000));

  const afterReg = await evalJs(`JSON.stringify({url:location.pathname,heading:document.querySelector('h1')?.textContent,err:document.querySelector('.text-\\\\[13px\\\\]')?.textContent})`);
  console.log('4. after registration:', afterReg);

  const creds = await send('WebAuthn.getCredentials', { authenticatorId });
  console.log('5. credentials stored on authenticator:', creds.credentials.length);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('C:/Users/USER/topos/verify-dashboard.png', Buffer.from(shot.data, 'base64'));
  console.log('6. dashboard screenshot written');

  // Sign out, then sign back in with the same passkey
  console.log('7. sign out:', await evalJs(`document.querySelector('button[aria-label="Sign out"]')?.click() ?? 'clicked'`));
  await new Promise((r) => setTimeout(r, 3000));
  console.log('   back at:', await evalJs(`location.pathname`));

  await evalJs(`[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Open Workspace'))?.click()`);
  await new Promise((r) => setTimeout(r, 900));
  await evalJs(`(()=>{const i=document.querySelector('input');const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(i,'studio-north');i.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  console.log('8. sign in:', await evalJs(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue with passkey'))?.click() ?? 'clicked'`));
  await new Promise((r) => setTimeout(r, 5000));
  console.log('9. after sign-in:', await evalJs(`JSON.stringify({url:location.pathname,heading:document.querySelector('h1')?.textContent})`));

  console.log('--- console errors ---');
  console.log(logs.length ? logs.join('\n') : '(none)');

  ws.close();
  await fetch(`${CDP}/json/close/${target.id}`);
}
main().catch((e) => { console.error(e); process.exit(1); });

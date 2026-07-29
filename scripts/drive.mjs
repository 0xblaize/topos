const [url] = process.argv.slice(2);

async function main() {
  const res = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params) => new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  const errors = [];
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
    }
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg.result);
  };
  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });
  await new Promise((r) => setTimeout(r, 3000));

  const evalJs = async (expr) => {
    const out = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (out.exceptionDetails) return { error: out.exceptionDetails.text + ' ' + (out.exceptionDetails.exception?.description || '') };
    return out.result.value;
  };

  console.log('--- sections present ---');
  console.log(await evalJs(`JSON.stringify(Array.from(document.querySelectorAll('section[id]')).map(s=>s.id))`));

  console.log('--- initial demo state ---');
  console.log(await evalJs(`(()=>{const p=document.querySelector('.comparison-panel');const btns=Array.from(document.querySelectorAll('.comparison-controls button')).map(b=>({t:b.textContent.trim(),pressed:b.getAttribute('aria-pressed')}));return JSON.stringify({panelText:p?p.innerText.replace(/\\n/g,' | ').slice(0,200):null,btns})})()`));

  console.log('--- click each comparison control ---');
  const count = await evalJs(`document.querySelectorAll('.comparison-controls button').length`);
  for (let i = 0; i < count; i++) {
    await evalJs(`document.querySelectorAll('.comparison-controls button')[${i}].click()`);
    await new Promise((r) => setTimeout(r, 700));
    console.log(i, await evalJs(`(()=>{const b=document.querySelectorAll('.comparison-controls button')[${i}];const p=document.querySelector('.comparison-panel');return JSON.stringify({clicked:b.textContent.trim(),pressed:b.getAttribute('aria-pressed'),maskVisible:!!document.querySelector('.mask-overlay,.erase-mask'),panel:p?p.innerText.replace(/\\n/g,' | ').slice(0,160):null})})()`));
  }

  console.log('--- anchor targets resolve ---');
  console.log(await evalJs(`JSON.stringify(Array.from(document.querySelectorAll('a[href^="#"]')).map(a=>({href:a.getAttribute('href'),ok:!!document.querySelector(a.getAttribute('href'))})))`));

  console.log('--- console errors ---');
  console.log(errors.length ? errors.join('\n') : '(none)');

  ws.close();
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

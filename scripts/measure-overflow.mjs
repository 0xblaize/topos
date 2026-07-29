const CDP_PORT = 9222;

async function main() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(process.argv[2])}`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params) => new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg.result);
  };
  await new Promise((r) => (ws.onopen = r));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await new Promise((r) => setTimeout(r, 2500));
  const expr = `(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      if (r.right > vw + 1 || r.left < -1) {
        offenders.push({ tag: el.tagName, cls: el.className && String(el.className).slice(0, 40), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) });
      }
    });
    return JSON.stringify({ vw, docScrollWidth: document.documentElement.scrollWidth, count: offenders.length, offenders: offenders.slice(0, 25) }, null, 1);
  })()`;
  const out = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log(out.result.value);
  ws.close();
  await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${target.id}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

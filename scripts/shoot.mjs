import { writeFileSync } from 'node:fs';

const [url, width, height, out, fullPage] = process.argv.slice(2);

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
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg.result);
  };
  await new Promise((r) => (ws.onopen = r));
  await send('Emulation.setDeviceMetricsOverride', {
    width: Number(width),
    height: Number(height),
    deviceScaleFactor: 2,
    mobile: Number(width) < 700,
  });
  await new Promise((r) => setTimeout(r, 3000));
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: fullPage === 'full',
  });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('wrote', out);
  ws.close();
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

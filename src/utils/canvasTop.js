const { createCanvas, loadImage } = require('canvas');
const fetch = require('node-fetch');

async function generateTopImage(guild, rows, title = 'Top Day') {
  const width = 1200;
  const height = 675;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f1724';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px Sans';
  ctx.fillText(title, 50, 70);
  let y = 140;
  const avatarSize = 64;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Sans';
    ctx.fillText(`#${i + 1}`, 50, y + 44);
    const name = r.tag || `<@${r.userId}>`;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px Sans';
    ctx.fillText(name, 110, y + 40);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '20px Sans';
    ctx.fillText(`Text: ${r.dailyText || 0}  Voice: ${r.dailyVoice || 0}`, 110, y + 68);
    try {
      let avatarUrl = r.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`;
      if (avatarUrl.startsWith('http')) {
        const res = await fetch(avatarUrl);
        const buf = await res.buffer();
        const img = await loadImage(buf);
        ctx.drawImage(img, 20, y, avatarSize, avatarSize);
      }
    } catch (e) {}
    y += 100;
    if (y > height - 100) break;
  }
  return canvas.toBuffer('image/png');
}

module.exports = { generateTopImage };

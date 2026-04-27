const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const W = 800, H = 450;

const THEMES = {
  royal:  { color1: '#141E30', color2: '#243B55', textColor: '#ffffff' },
  ocean:  { color1: '#2193b0', color2: '#6dd5ed', textColor: '#ffffff' },
  purple: { color1: '#8E2DE2', color2: '#4A00E0', textColor: '#ffffff' },
  fire:   { color1: '#f12711', color2: '#f5af19', textColor: '#ffffff' },
  forest: { color1: '#134E5E', color2: '#71B280', textColor: '#ffffff' },
  sunset: { color1: '#f953c6', color2: '#b91d73', textColor: '#ffffff' },
  mint:   { color1: '#00b09b', color2: '#96c93d', textColor: '#ffffff' },
  gold:   { color1: '#f7971e', color2: '#ffd200', textColor: '#1a1a1a' },
  rose:   { color1: '#f093fb', color2: '#f5576c', textColor: '#ffffff' },
  dark:   { color1: '#1a1a2e', color2: '#0f3460', textColor: '#ffffff' },
};

const state = {
  title:       '블로그 제목을\n입력하세요',
  subtitle:    '부제목 또는 설명을 여기에 입력하세요',
  tag:         '#태그',
  font:        'Apple SD Gothic Neo, Malgun Gothic, sans-serif',
  titleSize:   52,
  textAlign:   'center',
  gradientDir: 'diagonal',
  color1:      '#141E30',
  color2:      '#243B55',
  textColor:   '#ffffff',
  decoration:  'circles',
};

function pill(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y,         x + r, y,         r);
  ctx.closePath();
}

function getWrappedLines(text, maxWidth) {
  if (!text) return [];
  const lines = [];
  for (const para of text.split('\n')) {
    const words = para.split(' ').filter(Boolean);
    if (!words.length) { lines.push(''); continue; }
    let cur = '';
    for (const word of words) {
      const test = cur ? cur + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

function makeGradient() {
  let g;
  switch (state.gradientDir) {
    case 'horizontal': g = ctx.createLinearGradient(0, 0, W, 0);                               break;
    case 'vertical':   g = ctx.createLinearGradient(0, 0, 0, H);                               break;
    case 'radial':     g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.hypot(W,H)/2); break;
    default:           g = ctx.createLinearGradient(0, 0, W, H);
  }
  g.addColorStop(0, state.color1);
  g.addColorStop(1, state.color2);
  return g;
}

function drawDecorations() {
  const d = state.decoration;
  if (d === 'none') return;
  ctx.save();

  if (d === 'circles') {
    ctx.fillStyle = state.textColor;
    ctx.globalAlpha = 0.12;
    ctx.beginPath(); ctx.arc(W - 55, -25, 170, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.09;
    ctx.beginPath(); ctx.arc(25, H + 15, 120, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.06;
    ctx.beginPath(); ctx.arc(W - 180, H / 2 + 90, 75, 0, Math.PI * 2); ctx.fill();

  } else if (d === 'dots') {
    ctx.fillStyle = state.textColor;
    const sp = 28;
    for (let x = sp; x < W; x += sp) {
      for (let y = sp; y < H; y += sp) {
        const dist = Math.hypot(x - W / 2, y - H / 2);
        ctx.globalAlpha = Math.max(0, 0.18 - dist / (W * 1.1));
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }

  } else if (d === 'lines') {
    ctx.strokeStyle = state.textColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.09;
    for (let i = -H; i < W + H; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
    }

  } else if (d === 'geometric') {
    ctx.strokeStyle = state.textColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.12;
    ctx.strokeRect(W - 135, 18, 105, 65);
    ctx.globalAlpha = 0.07;
    ctx.strokeRect(W - 122, 30, 80, 40);
    ctx.globalAlpha = 0.1;
    ctx.strokeRect(18, H - 85, 105, 65);
    ctx.globalAlpha = 0.05;
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  }

  ctx.restore();
}

function drawTextBlock() {
  const PAD       = 80;
  const MAX_W     = W - PAD * 2;
  const LINE_H    = state.titleSize * 1.28;
  const SUB_SIZE  = Math.max(18, Math.round(state.titleSize * 0.37));
  const TAG_H     = 32;
  const TAG_SIZE  = 15;
  const G_TAG     = 14;
  const G_SUB     = 18;

  ctx.font = `bold ${state.titleSize}px ${state.font}`;
  const titleLines  = getWrappedLines(state.title, MAX_W);
  const titleBlockH = titleLines.length * LINE_H;

  let totalH = titleBlockH;
  if (state.tag)      totalH += TAG_H + G_TAG;
  if (state.subtitle) totalH += G_SUB + SUB_SIZE * 1.4;

  let y = Math.round(H / 2 - totalH / 2);

  let textX;
  switch (state.textAlign) {
    case 'left':  textX = PAD;       ctx.textAlign = 'left';   break;
    case 'right': textX = W - PAD;   ctx.textAlign = 'right';  break;
    default:      textX = W / 2;     ctx.textAlign = 'center';
  }

  if (state.tag) {
    ctx.save();
    ctx.font = `600 ${TAG_SIZE}px ${state.font}`;
    ctx.textBaseline = 'middle';
    const tw   = ctx.measureText(state.tag).width;
    const padX = 14;
    const tagW = tw + padX * 2;
    let rx = textX;
    if (state.textAlign === 'center') rx = textX - tagW / 2;
    if (state.textAlign === 'right')  rx = textX - tagW;

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = state.textColor;
    pill(rx, y, tagW, TAG_H, TAG_H / 2); ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = state.textColor;
    ctx.lineWidth = 1;
    pill(rx, y, tagW, TAG_H, TAG_H / 2); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = state.textColor;
    ctx.fillText(state.tag, textX, y + TAG_H / 2);
    ctx.restore();
    y += TAG_H + G_TAG;
  }

  ctx.font = `bold ${state.titleSize}px ${state.font}`;
  ctx.fillStyle = state.textColor;
  ctx.textBaseline = 'top';
  ctx.shadowColor   = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur    = 10;
  ctx.shadowOffsetY = 2;

  for (const line of titleLines) {
    ctx.fillText(line, textX, y);
    y += LINE_H;
  }
  y += G_SUB;

  if (state.subtitle) {
    ctx.font = `400 ${SUB_SIZE}px ${state.font}`;
    ctx.fillStyle   = state.textColor;
    ctx.globalAlpha = 0.78;
    ctx.shadowBlur  = 6;
    ctx.fillText(state.subtitle, textX, y);
    ctx.globalAlpha = 1;
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = makeGradient();
  ctx.fillRect(0, 0, W, H);
  drawDecorations();
  drawTextBlock();
}

function $(id) { return document.getElementById(id); }

$('inp-title').addEventListener('input',    e => { state.title       = e.target.value; draw(); });
$('inp-subtitle').addEventListener('input', e => { state.subtitle    = e.target.value; draw(); });
$('inp-tag').addEventListener('input',      e => { state.tag         = e.target.value; draw(); });
$('inp-font').addEventListener('change',    e => { state.font        = e.target.value; draw(); });
$('inp-size').addEventListener('input',     e => {
  state.titleSize = Number(e.target.value);
  $('lbl-size').textContent = state.titleSize;
  draw();
});
$('inp-c1').addEventListener('input',    e => { state.color1      = e.target.value; draw(); });
$('inp-c2').addEventListener('input',    e => { state.color2      = e.target.value; draw(); });
$('inp-tc').addEventListener('input',    e => { state.textColor   = e.target.value; draw(); });
$('inp-grad').addEventListener('change', e => { state.gradientDir = e.target.value; draw(); });
$('inp-deco').addEventListener('change', e => { state.decoration  = e.target.value; draw(); });

document.querySelectorAll('.tog-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.textAlign = btn.dataset.align;
    document.querySelectorAll('.tog-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    draw();
  });
});

document.querySelectorAll('.theme-swatch').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = THEMES[btn.dataset.theme];
    if (!t) return;
    state.color1    = t.color1;
    state.color2    = t.color2;
    state.textColor = t.textColor;
    $('inp-c1').value = t.color1;
    $('inp-c2').value = t.color2;
    $('inp-tc').value = t.textColor;
    document.querySelectorAll('.theme-swatch').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    draw();
  });
});

$('btn-export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'thumbnail-800x450.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
});

$('inp-title').value    = state.title;
$('inp-subtitle').value = state.subtitle;
$('inp-tag').value      = state.tag;

draw();

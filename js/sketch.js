const drawFns = {};
// ...existing code...
// ...existing code...

// ========== JANUARY (target 0) ========== //
drawFns['0'] = (p, g, st) => {
  // --- Settings ---
  const SETTINGS = {
    word: "JANUARY",
    fg: "#000000",
    bg: "#ffffff",
    FontSize: 18,
    TopMargin: 12,
    BottomMargin: 12,
    SideMargin: 20,
    StartValue: 0,
    EndValue: 130,
    Duration: 2.5,
    Delay: 0.08,
    Distance: 20,
    Speed: 0.015,
    Gamma: 1,
    Phase: 0,
    RowPhase: 0.12,
    DelayCurve: 1
  };
  if (!st.inited) {
    st.inited = true;
    st.t = 0;
    st.dots = [];
    st.font = loadedFont;
    // Dot 초기화
    for (let i = 0; i < 8; i++) {
      st.dots.push({
        x: p.random(g.width),
        y: p.random(g.height),
        theta: p.random(p.TWO_PI),
        k: p.random(0.6, 1.4)
      });
    }
  }
  g.background(SETTINGS.bg);
  // kinetic text
    g.fill('#888888'); // kinetic text 회색
  g.noStroke();
  g.textSize(SETTINGS.FontSize);
  g.textFont(st.font || 'serif');
  g.textAlign(p.LEFT, p.CENTER);
  const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
  const copies = p.constrain(Math.floor(usableH / SETTINGS.Distance), 1, 1200);
  const phaseOff = SETTINGS.Phase * SETTINGS.Duration;
  for (let idx = 0; idx < copies; idx++) {
    const rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
    const curvedDelay = SETTINGS.Delay * Math.pow(rowFrac, SETTINGS.DelayCurve);
    const timeWithDelay = (st.t + phaseOff + idx * SETTINGS.RowPhase) - curvedDelay;
    const progressRaw = Math.abs(Math.sin(p.PI * (timeWithDelay / SETTINGS.Duration) * 0.6));
    const progress = Math.pow(progressRaw, SETTINGS.Gamma);
    const tracking = SETTINGS.StartValue + progress * (SETTINGS.EndValue - SETTINGS.StartValue);
    const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
    const totalW = trackedTextWidth(SETTINGS.word, tracking, g);
    const x = SETTINGS.SideMargin;
    drawTrackedText(SETTINGS.word, x, y, tracking, g);
  }
  // flowing dots
  g.fill(SETTINGS.fg);
  g.noStroke();
  g.textSize(100);
  // 텍스트 영역 계산
  const lastTextY = SETTINGS.TopMargin + (copies - 1) * SETTINGS.Distance;
  const textAreaBottom = lastTextY + SETTINGS.FontSize;
  const capY = textAreaBottom - 50; // DOT_SIZE/2
  for (let pDot of st.dots) {
    const wind = p.noise(pDot.y * 0.002, (st.t + pDot.theta) * 0.2) - 0.5;
    const sway = Math.sin(pDot.theta + st.t * 0.8) * 0.6;
    const fall = (1.2 + 2.2 * Math.abs(Math.sin(p.PI * (st.t / SETTINGS.Duration) * 0.6))) * 1.1 * pDot.k;
    pDot.x += wind * 3 + sway;
    pDot.y += fall;
    if (pDot.y > capY) {
      pDot.y = SETTINGS.TopMargin - 10;
      pDot.x = p.random(g.width);
    }
    if (pDot.x < -10) pDot.x = g.width + 10;
    if (pDot.x > g.width + 10) pDot.x = -10;
    const yDraw = Math.min(pDot.y, capY);
    g.text('.', pDot.x, yDraw);
  }
  st.t += SETTINGS.Speed;
};
  function drawTrackedText(str, x, y, tracking, g) {
    g.noStroke();
    let xpos = x;
    for (let i = 0; i < str.length; i++) {
      g.text(str[i], xpos, y);
      xpos += g.textWidth(str[i]) + tracking;
    }
  }
  function trackedTextWidth(str, tracking, g) {
    let w = 0;
    for (let i = 0; i < str.length; i++) w += g.textWidth(str[i]);
    return w + tracking * (str.length - 1);
  }
  function progressByMonth(m, twd, dur) {
    const u = twd / dur;
    const uf = fract(u);
    if (m === 3) {
      return clamp(0.65 * Math.abs(Math.sin(Math.PI * u * 1.05)) + 0.35 * easeInOutCubic(uf), 0, 1);
    } else {
      return Math.abs(Math.sin(Math.PI * u));
    }
  }
  function computeParticleAngle(p, g) {
    return p._angle;
  }
  function fract(x) { return x - Math.floor(x); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
// ...existing code...
// --- March (target 2) / SVG y좌표 + 웨이브 모션 + comma rain ---

drawFns['2'] = (p, g, st) => {
  // kinetic type: 각 행의 기준 y좌표를 SVG에서 추출한 값으로 두고, 그 기준에서만 살짝 움직임 + 콤마 rain
  if (!st.inited) {
    st.inited = true;
    st.font = loadedFont;
    st.svgY = [41,51,61,71,81,91,101,111,121,131,141,151,161,171,181,191,201,211,221,231,241,251,261,271,281,291,301,311,321,331,341,351,361,371,381,391,401,411,421,431,441,451,461,471,481,491,501,511,521,531,541,551,561,571,581,591,601,611,621,631,641,651,661,671,681];
    st.word = "february";
    st.FontSize = 19;
    st.StartValue = 0;
    st.EndValue = 260;
    st.Duration = 4.0;
    st.Delay = 0.08;
    st.Gamma = 3;
    st.Phase = 0;
    st.RowPhase = 0.05;
    st.DelayCurve = 1;
    st.Amplitude = 50;
    st.t = 0;
    // 콤마 rain 파티클 초기화
    st.dots = [];
    st.ParticleGlyph = ',';
    st.ParticleCount = 14;
    st.SlashSpawnTopPad = 40;
    for (let i = 0; i < st.ParticleCount; i++) {
      st.dots.push({
        x: p.random(g.width),
        y: p.random(0 - st.SlashSpawnTopPad, g.height),
        vx: p.random(-0.6, 0.6),
        vy: p.random(0.9, 1.7),
        theta: p.random(p.TWO_PI),
        rnd: p.random(-1, 1),
        k: p.random(0.75, 1.35),
        alpha: 255,
      });
    }
  }
  g.background('#ffffff');
  g.fill('#cccccc'); // kinetic text 더 연한 회색
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(st.FontSize);
  g.textAlign(p.LEFT, p.CENTER);
  let now = p.millis() / 1000;
  let copies = st.svgY.length;
  for (let idx = 0; idx < copies; idx++) {
    let rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
    let curvedDelay = st.Delay * Math.pow(rowFrac, st.DelayCurve);
    let timeWithDelay = (now + st.Phase + idx * st.RowPhase) - curvedDelay + st.Duration/2;
    let progressRaw = 1 - Math.abs(2 * fract(timeWithDelay / st.Duration) - 1);
    let progress = Math.pow(progressRaw, st.Gamma);
    let tracking = st.StartValue + progress * (st.EndValue - st.StartValue);
    let y = st.svgY[idx] + st.Amplitude * (progress - 0.5);
    // 중앙정렬
    let totalW = 0;
    for (let i = 0; i < st.word.length; i++) totalW += g.textWidth(st.word[i]);
    totalW += tracking * (st.word.length - 1);
    let x = g.width / 2 - totalW / 2;
    let xpos = x;
    for (let i = 0; i < st.word.length; i++) {
      g.text(st.word[i], xpos, y);
      xpos += g.textWidth(st.word[i]) + tracking;
    }
  }
  // 콤마 rain
  g.fill('#000000'); // 콤마는 검은색
  g.textSize(44);
  for (let pDot of st.dots) {
    const wind = 0.5 * (p.noise(pDot.y * 0.002, st.t * 0.1) - 0.5);
    const drift = 0.5 * Math.sin(st.t * p.TWO_PI * 0.1 + pDot.theta);
    pDot.vx += wind * 0.08 + drift * 0.02;
    pDot.vy += 0.5 * 0.07 * pDot.k;
    pDot.vy = Math.min(pDot.vy, 8 * pDot.k);
    pDot.x += pDot.vx;
    pDot.y += pDot.vy;
    if (pDot.vy < 0) {
      pDot.alpha -= 7;
    } else {
      pDot.alpha = Math.min(pDot.alpha + 5, 255);
    }
    let febEndY = 666.5;
    if (pDot.y > febEndY) {
      pDot.y = febEndY;
      pDot.vy = -p.random(2, 7);
      pDot.vx += p.random(-0.2, 0.2);
      pDot.alpha = 255;
    }
    if (pDot.alpha < 10) {
      pDot.y = -20;
      pDot.x = p.random(g.width);
      pDot.vx = p.random(-0.6, 0.6);
      pDot.vy = p.random(1.0, 2.2);
      pDot.alpha = 255;
    }
    if (pDot.y > g.height + 20) {
      pDot.y = -20; pDot.x = p.random(g.width);
      pDot.vx = p.random(-0.6, 0.6); pDot.vy = p.random(2.0, 4.2);
    }
    if (pDot.x < -10) pDot.x = g.width + 10;
    if (pDot.x > g.width + 10) pDot.x = -10;
    const ang = pDot.theta + st.t * 0.8;
    g.push();
    g.translate(pDot.x, pDot.y);
    g.rotate(ang);
    g.text(st.ParticleGlyph, 0, 0);
    g.pop();
  }
  st.t += 1/30;
};
// ---------- 공통 설정 ----------
const IDS = Array.from({ length: 13 }, (_, i) => i.toString()); // "0"..."12"
// ...existing code...
// 8.5cm x 19cm를 px로 변환 (1인치=2.54cm, 1인치=96px)
const PX_PER_CM = 96 / 2.54;
const CANVAS_W = Math.round(8.5 * PX_PER_CM);
const CANVAS_H = Math.round(19 * PX_PER_CM);
// HTMLCanvas, p5.Graphics, 가시성, 상태
const canvases = {};   // { '0': HTMLCanvasElement, ... }
const layers = {};     // { '0': p5.Graphics, ... }
const visible = {};    // { '0': boolean, ... }
const STATE = {};      // { '0': {...}, ... }
// 폰트 경로 (네 경로로 수정 가능)
const FONT_PATH = 'IPAMincho Regular.ttf';
let loadedFont = null;

/* ============= January (target 0) ============= */
// --- January / Dot flow version (fixed params, no UI) ---

drawFns['3'] = (p, g, st) => {
  // Kinetic Type "2026" — MAR (slash rain)
  if (!st.inited) {
    st.inited = true;
    st.t = 382.595;
    st.dots = [];
    st.dotPhase = 0;
    st.dotSprite = null;
    st.dotSpriteSize = 0;
    st.font = loadedFont;
    st.SETTINGS = {
      word: 'march',
      month: 3,
      fg: '#000000',
      bg: '#ffffff',
      align: 'left',
      FontSize: 25,
      TopMargin: 6,
      BottomMargin: 0,
      SideMargin: 20,
      StartValue: 300,
      EndValue: 26,
      Duration: 1.52,
      Delay: 0.3,
      Distance: 39,
      Speed: 0.015,
      Gamma: 0.7,
      Phase: 0.059,
      RowPhase: 0.069,
      DelayCurve: 0,
      ParticleGlyph: '/',
      SlashGravity: 0.35,
      SlashDriftAmp: 0.6,
      SlashDriftFreq: 0.9,
      SlashWindAmp: 0.35,
      SlashWindFreq: 0.55,
      SlashTerminal: 5.0,
      SlashSpawnTopPad: 18
    };
    // dots 초기화
    for (let i = 0; i < 12; i++) {
      const angleDeg = p.random(-60, 60);
      st.dots.push({
        x: p.random(0, g.width),
        y: p.random(0 - st.SETTINGS.SlashSpawnTopPad, g.height),
        theta: p.random(p.TWO_PI),
        k: p.random(0.75, 1.35),
        vx: p.random(-0.6, 0.6),
        vy: p.random(2.2, 5.0),
        rnd: p.random(-1, 1),
        _angle: p.radians(angleDeg)
      });
    }
  }
  const S = st.SETTINGS;
  // kinetic header
  g.background(S.bg);
  g.fill('#cccccc'); // kinetic text 더 연한 회색
  g.textSize(S.FontSize);
  g.textFont(st.font || 'Suisse Intl Mono, Helvetica, Arial, monospace');
  const usableH = g.height - S.TopMargin - S.BottomMargin;
  const copies = p.constrain(Math.floor(usableH / S.Distance), 1, 1200);
  const phaseOff = S.Phase * S.Duration;
  for (let idx = 0; idx < copies; idx++) {
    const rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
    const curvedDelay = S.Delay * Math.pow(rowFrac, S.DelayCurve);
    const timeWithDelay = (st.t + phaseOff + idx * S.RowPhase) - curvedDelay;
    const progressRaw = progressByMonth(S.month, timeWithDelay, S.Duration);
    const progress = Math.pow(progressRaw, S.Gamma);
    const tracking = S.StartValue + progress * (S.EndValue - S.StartValue);
    const y = S.TopMargin + idx * S.Distance;
    const totalW = trackedTextWidth(S.word, tracking, g);
    let x;
    if (S.align === 'center') x = g.width / 2 - totalW / 2;
    else if (S.align === 'left') x = S.SideMargin;
    else x = g.width - S.SideMargin - totalW;
    drawTrackedText(S.word, x, y, tracking, g);
  }
  // slash rain
  // dotSprite 생성
  if (!st.dotSprite || st.dotSpriteSize !== 38) {
    const glyphSize = 38;
    const S2 = Math.floor(glyphSize * 2.0);
    st.dotSpriteSize = glyphSize;
    st.dotSprite = p.createGraphics(S2, S2);
    st.dotSprite.pixelDensity(2);
    st.dotSprite.background(0, 0);
    st.dotSprite.noStroke();
    st.dotSprite.fill(0);
    st.dotSprite.textFont(st.font || 'Suisse Intl Mono, Helvetica, Arial, monospace');
    st.dotSprite.textSize(glyphSize);
    st.dotSprite.textAlign(g.CENTER, g.BASELINE);
    const asc = st.dotSprite.textAscent();
    const desc = st.dotSprite.textDescent();
    const H = asc + desc;
    const padY = (S2 - H) * 0.5;
    const cx = S2 * 0.5;
    const baseY = padY + asc;
    st.dotSprite.drawingContext.imageSmoothingEnabled = true;
    st.dotSprite.text(S.ParticleGlyph || '/', cx, baseY);
    st.dotSpriteBottomOffset = (baseY + desc) - (S2 * 0.5);
  }
  g.push();
  const col = g.color(S.fg);
  g.tint(g.red(col), g.green(col), g.blue(col), 255);
  g.drawingContext.imageSmoothingEnabled = true;
  for (let pDot of st.dots) {
    const wind = S.SlashWindAmp * (p.noise((pDot.y + st.t * 110) * 0.002, (st.t + pDot.theta) * S.SlashWindFreq) - 0.5);
    const drift = S.SlashDriftAmp * Math.sin(st.t * p.TWO_PI * S.SlashDriftFreq + pDot.theta);
    pDot.vx += (wind * 0.08 + drift * 0.02);
    pDot.vy += S.SlashGravity * 0.18 * pDot.k;
    pDot.vy = Math.min(pDot.vy, S.SlashTerminal * pDot.k);
    pDot.x += pDot.vx;
    pDot.y += pDot.vy;
    // 래핑/리스폰 - 텍스트 마지막 줄과 맞춤
    const usableH = g.height - S.TopMargin - S.BottomMargin;
    const copies = p.constrain(Math.floor(usableH / S.Distance), 1, 1200);
    const lastRowY = S.TopMargin + (copies - 1) * S.Distance + S.FontSize;
    const capY = lastRowY - (st.dotSprite ? st.dotSpriteBottomOffset : 0);
    if (pDot.y > capY) {
      pDot.y = 0 - S.SlashSpawnTopPad;
      pDot.x = p.random(0, g.width);
      pDot.vx = p.random(-0.6, 0.6);
      pDot.vy = p.random(2.0, 4.2);
    }
    if (pDot.x < -10)  pDot.x = g.width + 10;
    if (pDot.x > g.width + 10) pDot.x = -10;
    // 회전 각도: 낙하 속도 기반
    pDot._angle = pDot._angle;
    g.push();
    const drawY = Math.min(pDot.y, capY);
    g.translate(Math.round(pDot.x), Math.round(drawY));
    if (pDot._angle !== 0) g.rotate(pDot._angle);
    g.image(st.dotSprite, 0, 0);
    g.pop();
  }
  g.pop();
  st.t += S.Speed;
  st.dotPhase += S.Speed;
};

// ========== APRIL (target 4) ========== //
drawFns['4'] = (p, g, st) => {
  // --- Settings ---
  const SETTINGS = {
    word: 'april',
    fg: '#000000',
    bg: '#ffffff',
    FontSize: 18,
    TopMargin: 20,
    SideMargin: 20,
    StartValue: 300,
    EndValue: 26,
    Duration: 1.52,
    Delay: 0.3,
    Distance: 55,
    Speed: 0.065,
    Gamma: 0.7,
    Phase: 0.059,
    RowPhase: 0.069,
    DelayCurve: 0,
    ParenGlyphL: '(',
    ParenGlyphR: ')',
    ParenCount: 18,
    ParenSize: 24
  };
  
  if (!st.inited) {
    st.inited = true;
    st.t = 382.595;
    st.font = loadedFont;
    
    // 괄호 파티클 초기화
    st.parens = [];
    const topMargin = SETTINGS.TopMargin;
    const usableH = g.height - topMargin;
    const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
    const actualTextHeight = (copies - 1) * SETTINGS.Distance;
    const textBottom = topMargin + actualTextHeight;
    const finalBottom = p.min(textBottom, g.height);
    
    for (let i = 0; i < SETTINGS.ParenCount; i++) {
      const isRight = p.random() < 0.7;
      st.parens.push({
        x: p.random(SETTINGS.SideMargin, g.width - SETTINGS.SideMargin),
        y: p.random(topMargin, finalBottom),
        vx: p.random(-1.5, 1.5),
        vy: p.random(-1.0, 1.0),
        theta: p.random(p.TWO_PI),
        isRight,
        windPhase: p.random(p.TWO_PI)
      });
    }
  }
  
  // 배경
  g.background(SETTINGS.bg);
  
  // --- april 타이포그래피 ---
  g.fill(SETTINGS.fg);
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(SETTINGS.FontSize);
  g.textAlign(p.LEFT, p.CENTER);
  
  const usableH = g.height - SETTINGS.TopMargin;
  const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
  const usableWidth = g.width - (SETTINGS.SideMargin * 2);
  const charCount = SETTINGS.word.length;
  const estimatedCharWidth = SETTINGS.FontSize * 0.6;
  const totalCharWidth = estimatedCharWidth * charCount;
  const availableSpaceForTracking = usableWidth - totalCharWidth;
  const optimalTracking = p.max(5, availableSpaceForTracking / (charCount - 1));
  
  for (let idx = 0; idx < copies; idx++) {
    const smoothProgress = (p.sin(st.t * 0.5) + 1) * 0.5;
    const trackingRange = optimalTracking * 0.4;
    const tracking = optimalTracking + trackingRange * (smoothProgress - 0.5) * 2;
    const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
    
    let xpos = SETTINGS.SideMargin;
    for (let i = 0; i < SETTINGS.word.length; i++) {
      const ch = SETTINGS.word[i];
      g.text(ch, xpos, y);
      xpos += g.textWidth(ch) + tracking;
    }
  }
  
  // --- 괄호 파티클 (April buds) ---
  g.push();
  g.textAlign(p.CENTER, p.CENTER);
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(SETTINGS.ParenSize);
  
  const topMargin = SETTINGS.TopMargin;
  const usableHParen = g.height - topMargin;
  const copiesParen = p.constrain(p.floor(usableHParen / SETTINGS.Distance), 1, 1200);
  const actualTextHeight = (copiesParen - 1) * SETTINGS.Distance;
  const textBottom = topMargin + actualTextHeight;
  const finalBottom = p.min(textBottom, g.height);
  
  const col = p.color(SETTINGS.fg);
  
  for (let pParen of st.parens) {
    // 강한 바람 효과
    const windStrength = 0.35 * 8.0;
    const windFreq = 0.55 * 2.0;
    const driftAmp = 0.6 * 6.0;
    
    const windX = windStrength * p.sin(st.t * windFreq + pParen.windPhase + pParen.x * 0.001);
    const windY = windStrength * p.sin(st.t * windFreq * 0.6 + pParen.windPhase + pParen.y * 0.001) * 0.7;
    
    const driftX = driftAmp * p.sin(st.t * 0.6 + pParen.theta) * 1.2;
    const driftY = driftAmp * p.sin(st.t * 0.5 + pParen.theta * 1.3) * 1.0;
    
    const noiseScale = 0.005;
    const noiseX = (p.noise(pParen.x * noiseScale, pParen.y * noiseScale, st.t * 0.8) - 0.5) * 2.0;
    const noiseY = (p.noise(pParen.x * noiseScale + 100, pParen.y * noiseScale + 100, st.t * 0.7) - 0.5) * 1.5;
    
    pParen.vx += windX * 0.15 + driftX * 0.12 + noiseX * 0.8;
    pParen.vy += windY * 0.15 + driftY * 0.12 + noiseY * 0.8;
    
    pParen.vx *= 0.75;
    pParen.vy *= 0.75;
    
    const maxSpeed = 8.0;
    const speed = p.sqrt(pParen.vx * pParen.vx + pParen.vy * pParen.vy);
    if (speed > maxSpeed) {
      pParen.vx = (pParen.vx / speed) * maxSpeed;
      pParen.vy = (pParen.vy / speed) * maxSpeed;
    }
    
    pParen.x += pParen.vx;
    pParen.y += pParen.vy;
    
    const margin = 30;
    if (pParen.x > g.width - SETTINGS.SideMargin + margin) pParen.x = SETTINGS.SideMargin - margin;
    if (pParen.x < SETTINGS.SideMargin - margin) pParen.x = g.width - SETTINGS.SideMargin + margin;
    if (pParen.y > finalBottom + margin) pParen.y = topMargin - margin;
    if (pParen.y < topMargin - margin) pParen.y = finalBottom + margin;
    
    const windAngle = pParen.vx * 0.8;
    const randomTilt = (pParen.theta / p.TWO_PI - 0.5) * 0.6;
    const gentleWobble = p.sin(st.t * 0.6 + pParen.windPhase) * 0.3;
    const ang = windAngle + randomTilt + gentleWobble;
    
    g.push();
    g.translate(pParen.x, pParen.y);
    g.rotate(ang);
    g.fill(p.red(col), p.green(col), p.blue(col), 255);
    g.text(pParen.isRight ? SETTINGS.ParenGlyphR : SETTINGS.ParenGlyphL, 0, 0);
    g.pop();
  }
  g.pop();
  
  st.t += SETTINGS.Speed;
};

drawFns['5'] = (p, g, st) => {
  // --- Settings ---
  const SETTINGS = {
    word: 'May',
    fg: '#000000',
    bg: '#ffffff',
    FontSize: 24,
    TopMargin: 20,
    BottomMargin: 0,
    SideMargin: 20,
    StartValue: -2,
    EndValue: 144,
    Duration: 2.04,
    Delay: 0.08,
    Distance: 34,
    Speed: 0.015,
    Gamma: 0.3,
    Phase: 1.0,
    RowPhase: 0.5,
    DelayCurve: 0,
    align: 'right',
    // Tilde particle settings
    EnableTildes: true,
    TildeCount: 15,
    TildeSize: 45,
    TildeGlyph: '~',
    BaseScale: 1.0
  };
  
  if (!st.inited) {
    st.inited = true;
    st.t = 229.935;
    st.font = loadedFont;
    st.tildes = [];
    
    // Initialize tilde particles with wave motion
    const minDistance = 60;
    const positions = [];
    const attempts = SETTINGS.TildeCount * 20;
    
    // Generate well-distributed positions
    for (let attempt = 0; attempt < attempts && positions.length < SETTINGS.TildeCount; attempt++) {
      const x = p.random(g.width * 0.1, g.width * 0.9);
      const y = p.random(-100, g.height * 1.2);
      
      let validPosition = true;
      for (const pos of positions) {
        const distance = p.dist(x, y, pos.x, pos.y);
        if (distance < minDistance) {
          validPosition = false;
          break;
        }
      }
      
      if (validPosition) {
        positions.push({ x, y });
      }
    }
    
    // Create tildes from positions
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
      const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
      const nearestRow = p.floor((pos.y - SETTINGS.TopMargin) / SETTINGS.Distance);
      
      st.tildes.push({
        baseX: pos.x,
        baseY: pos.y,
        x: pos.x,
        y: pos.y,
        ang: p.random(p.TWO_PI),
        nseed: p.random(1000),
        phaseX: p.random(p.TWO_PI),
        phaseY: p.random(p.TWO_PI),
        life: 0,
        scale: SETTINGS.BaseScale,
        index: i,
        rowInfluence: p.random(0.1, 0.4),
        nearestRow: nearestRow
      });
    }
  }
  
  // Background
  g.background(SETTINGS.bg);
  
  // --- May Typography ---
  g.fill('#888888'); // kinetic text 회색
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(SETTINGS.FontSize);
  g.textAlign(p.LEFT, p.CENTER);
  
  const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
  const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
  const phaseOff = SETTINGS.Phase * SETTINGS.Duration;
  
  // Helper function for tracked text width
  const trackedTextWidth = (str, tracking) => {
    let w = 0;
    for (let i = 0; i < str.length; i++) w += g.textWidth(str[i]);
    return w + tracking * (str.length - 1);
  };
  
  for (let idx = 0; idx < copies; idx++) {
    const rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
    const curvedDelay = SETTINGS.Delay * p.pow(rowFrac, SETTINGS.DelayCurve);
    const timeWithDelay = (st.t + phaseOff + idx * SETTINGS.RowPhase) - curvedDelay;
    
    const u = timeWithDelay / SETTINGS.Duration;
    const progressRaw = p.abs(p.sin(p.PI * u * 0.6));
    const progress = p.pow(progressRaw, SETTINGS.Gamma);
    
    const tracking = SETTINGS.StartValue + progress * (SETTINGS.EndValue - SETTINGS.StartValue);
    const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
    
    // Right alignment
    let x;
    if (SETTINGS.align === 'left') {
      x = SETTINGS.SideMargin;
    } else if (SETTINGS.align === 'center') {
      x = g.width / 2 - trackedTextWidth(SETTINGS.word, tracking) / 2;
    } else {
      x = g.width - SETTINGS.SideMargin - trackedTextWidth(SETTINGS.word, tracking);
    }
    
    let xpos = x;
    for (let i = 0; i < SETTINGS.word.length; i++) {
      const ch = SETTINGS.word[i];
      g.text(ch, xpos, y);
      xpos += g.textWidth(ch) + tracking;
    }
  }
  
  // --- Tilde Particles (falling leaf motion) ---
  if (SETTINGS.EnableTildes) {
    g.push();
    g.textAlign(p.CENTER, p.CENTER);
    g.noStroke();
    g.textFont(st.font || 'IPAMincho Regular');
    g.textSize(SETTINGS.TildeSize);
    g.fill('#000000'); // 기호는 검은색
    
    const lastRowY = SETTINGS.TopMargin + (copies - 1) * SETTINGS.Distance;
    
    for (let pTilde of st.tildes) {
      // Falling leaf motion physics
      
      // 1. Pendulum swing (left-right oscillation) - increased
      const pendulumPhase = st.t * 2.0 + pTilde.phaseX + pTilde.index * 0.8;
      const pendulumSwing = p.sin(pendulumPhase) * 35;
      
      // 2. Zigzag motion (wind push) - increased
      const zigzagPhase = st.t * 1.5 + pTilde.phaseY * 0.7;
      const zigzagOffset = p.sin(zigzagPhase + pTilde.index * 0.4) * 20;
      
      // 3. Float motion (air resistance) - increased
      const floatPhase = st.t * 1.2 + pTilde.nseed;
      const floatOffset = p.sin(floatPhase) * 12;
      
      // 4. Gentle falling
      const fallSpeed = 0.3;
      pTilde.baseY += fallSpeed;
      
      // 5. Typography influence (subtle)
      let typographyInfluence = 0;
      if (pTilde.nearestRow >= 0 && pTilde.nearestRow < copies) {
        const rowFrac = (copies > 1) ? pTilde.nearestRow / (copies - 1) : 0;
        const curvedDelay = SETTINGS.Delay * p.pow(rowFrac, SETTINGS.DelayCurve);
        const timeWithDelay = (st.t + SETTINGS.Phase * SETTINGS.Duration + pTilde.nearestRow * SETTINGS.RowPhase) - curvedDelay;
        
        const u = timeWithDelay / SETTINGS.Duration;
        const progressRaw = p.abs(p.sin(p.PI * u * 0.6));
        const progress = p.pow(progressRaw, SETTINGS.Gamma);
        
        typographyInfluence = p.sin(progress * p.TWO_PI + st.t * 0.8) * pTilde.rowInfluence * 5;
      }
      
      // Final position
      pTilde.x = pTilde.baseX + pendulumSwing + zigzagOffset + typographyInfluence;
      pTilde.y = pTilde.baseY + floatOffset;
      
      // Rotation (wind tilt + spin) - increased
      const tiltPhase = st.t * 1.2 + pTilde.phaseX * 0.8;
      const windTilt = p.sin(tiltPhase + pTilde.index * 0.3) * 0.8;
      const spinPhase = st.t * 0.9 + pTilde.nseed;
      const leafSpin = p.sin(spinPhase) * 0.5;
      pTilde.ang = windTilt + leafSpin;
      
      // Scale (depth effect) - increased range from 0.7~1.1 to 1.1~1.5
      const depthPhase = st.t * 0.4 + pTilde.nseed * 0.5;
      const depthScale = 1.1 + p.sin(depthPhase) * 0.4;
      pTilde.scale = SETTINGS.BaseScale * depthScale;
      
      // Wrap around
      if (pTilde.y > lastRowY) {
        pTilde.baseY = p.random(-50, -20);
        pTilde.baseX = p.random(g.width * 0.1, g.width * 0.9);
        pTilde.phaseX = p.random(p.TWO_PI);
        pTilde.phaseY = p.random(p.TWO_PI);
        pTilde.nseed = p.random(1000);
      }
      
      if (pTilde.x < -30) {
        pTilde.baseX += g.width + 60;
      } else if (pTilde.x > g.width + 30) {
        pTilde.baseX -= g.width + 60;
      }
      
      pTilde.life += SETTINGS.Speed;
      
      // Draw tilde
      g.push();
      g.translate(p.round(pTilde.x), p.round(pTilde.y));
      g.rotate(pTilde.ang);
      g.scale(pTilde.scale);
      g.text(SETTINGS.TildeGlyph, 0, 0);
      g.pop();
    }
    g.pop();
  }
  
  st.t += SETTINGS.Speed;
};

drawFns['6'] = (p, g, st) => {
  // --- Settings ---
  const SETTINGS = {
    word: 'june',
    fg: '#000000',
    bg: '#ffffff',
    FontSize: 16,
    TopMargin: 16,
    BottomMargin: 0,
    SideMargin: 10,
    StartValue: 0,
    EndValue: 260,
    Duration: 2.5,
    Delay: 0.08,
    Distance: 48,
    Speed: 0.015,
    Gamma: 0.3,
    Phase: 0,
    RowPhase: 0,
    DelayCurve: 0.66,
    // Colon particle settings
    EnableColons: true,
    ColonCount: 12,
    ColonSize: 50
  };
  
  // SVG 실제 좌표 패턴 (june의 4글자 각 행별 x좌표)
  const svgRows = [
    [-61.44, 72.00, 205.44, 338.87],   // y=40
    [-51.56, 81.93, 215.41, 348.90],   // y=64
    [-41.64, 91.87, 225.39, 358.90],   // y=88
    [-31.70, 101.83, 235.36, 368.89],  // y=112
    [-21.77, 111.79, 245.34, 378.89],  // y=136
    [-31.75, 101.81, 235.38, 368.95],  // y=160
    [-21.81, 111.77, 245.36, 378.94],  // y=184
    [-11.86, 121.74, 255.34, 388.93],  // y=208
    [-1.91, 131.70, 265.32, 398.93],   // y=232
    [8.05, 141.67, 275.30, 408.92],    // y=256
    [-1.93, 131.70, 265.34, 398.97],   // y=280
    [8.02, 141.67, 275.32, 408.96],    // y=304
    [17.99, 151.64, 285.30, 418.96],   // y=328
    [27.95, 161.62, 295.28, 428.95],   // y=352
    [37.92, 171.59, 305.27, 438.95],   // y=376
    [27.93, 161.62, 295.30, 428.99],   // y=400
    [37.90, 171.59, 305.29, 438.99],   // y=424
    [47.87, 181.57, 315.28, 448.98],   // y=448
    [57.84, 191.55, 325.27, 458.98],   // y=472
    [67.81, 201.53, 335.26, 468.98],   // y=496
    [57.83, 191.56, 325.29, 459.02],   // y=520
    [67.80, 201.54, 335.28, 469.01],   // y=544
    [77.78, 211.52, 345.27, 479.01],   // y=568
    [87.75, 221.51, 355.26, 489.01],   // y=592
    [97.73, 231.49, 365.25, 499.01],   // y=616
    [87.75, 221.51, 355.28, 489.05]    // y=640
  ];
  
  if (!st.inited) {
    st.inited = true;
    st.t = 18.975;
    st.font = loadedFont;
    st.colons = [];
    st.startTime = p.millis();
    
    // Create colon sprite
    const size = SETTINGS.ColonSize;
    st.colonSprite = p.createGraphics(size, size);
    st.colonSprite.clear();
    st.colonSprite.noStroke();
    st.colonSprite.fill(0);
    const r = size * 0.18;
    st.colonSprite.ellipse(size/2, size*0.32, r, r);
    st.colonSprite.ellipse(size/2, size*0.68, r, r);
    st.colonSpriteSize = size;
    
    // Initialize colon particles
    const yMin = SETTINGS.TopMargin;
    const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
    const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
    const textBottom = SETTINGS.TopMargin + (copies - 1) * SETTINGS.Distance + SETTINGS.FontSize * 0.5;
    
    for (let i = 0; i < SETTINGS.ColonCount; i++) {
      st.colons.push({
        fixedX: p.random(g.width),
        fixedY: p.random(yMin, textBottom)
      });
    }
  }
  
  // Background
  g.background(SETTINGS.bg);
  
  // --- June Typography (SVG 곡선 패턴) ---
  g.fill('#888888'); // kinetic text 회색
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(SETTINGS.FontSize);
  g.textAlign(p.LEFT, p.CENTER);
  
  const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
  const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
  const phaseOff = SETTINGS.Phase * SETTINGS.Duration;
  
  for (let idx = 0; idx < copies && idx < svgRows.length; idx++) {
    const rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
    const curvedDelay = SETTINGS.Delay * p.pow(rowFrac, SETTINGS.DelayCurve);
    const timeWithDelay = (st.t + phaseOff + idx * SETTINGS.RowPhase) - curvedDelay;
    
    // June pattern: smooth wave
    const u = timeWithDelay / SETTINGS.Duration;
    const progressRaw = (p.sin(u * p.PI * 2) + 1) * 0.5;
    const progress = p.pow(progressRaw, SETTINGS.Gamma);
    
    const animationOffset = SETTINGS.StartValue + progress * (SETTINGS.EndValue - SETTINGS.StartValue);
    const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
    const baseCharPositions = svgRows[idx];
    
    // 각 글자를 SVG 패턴 + 애니메이션 오프셋으로 배치
    const chars = SETTINGS.word.split('');
    for (let i = 0; i < chars.length && i < baseCharPositions.length; i++) {
      const scaleFactor = g.width / 500;
      const x = (baseCharPositions[i] + animationOffset) * scaleFactor + SETTINGS.SideMargin;
      g.text(chars[i], x, y);
    }
  }
  
  // --- Colon Particles ---
  if (SETTINGS.EnableColons && st.colonSprite) {
    const now = (p.millis() - st.startTime) / 1000;
    const textBottom = SETTINGS.TopMargin + (copies - 1) * SETTINGS.Distance + SETTINGS.FontSize * 0.5;
    
    for (let i = 0; i < st.colons.length; i++) {
      let d = st.colons[i];
      
      // 각 콜론마다 고유한 위상
      const phase = i * 0.7;
      const t = now + phase;
      
      // 좌우 흔들림 (x축)
      const xWobble = d.fixedX + p.sin(t * 1.5) * 25;
      
      // 상하 미세 흔들림 (y축)
      const yWobble = d.fixedY + p.sin(t * 1.2 + phase) * 20;
      const yClamped = p.min(yWobble, textBottom);
      
      // 회전
      const rotation = p.sin(t * 1.8 + phase) * p.radians(15);
      
      // Fade in/out (투명도 변화)
      const fadeAlpha = (p.sin(t * 1.0 + phase) + 1) * 0.5;
      
      g.push();
      g.translate(xWobble, yClamped);
      g.rotate(rotation);
      g.tint(255, fadeAlpha * 255);
      g.image(st.colonSprite, -st.colonSpriteSize/2, -st.colonSpriteSize/2);
      g.pop();
    }
    g.noTint();
  }
  
  st.t += SETTINGS.Speed;
};

drawFns['7'] = (p, g, st) => {
  // --- Settings ---
  const SETTINGS = {
    word: 'July',
    fg: '#000000',
    bg: '#ffffff',
    FontSize: 18,
    Speed: 0.004,
    // Quote rain settings
    EnableQuotes: true,
    QuoteGlyph: '"',
    QuoteCount: 8,
    QuoteSize: 48,
    QuoteSpeedMin: 2.2,
    QuoteSpeedMax: 5.0,
    QuoteSpawnPad: 18,
    QuoteWindAmp: 0.35,
    QuoteWindFreq: 0.55,
    QuoteDriftAmp: 0.6,
    QuoteDriftFreq: 0.9,
    QuoteGravity: 0.85,
    QuoteTerminal: 12.0
  };
  
  // SVG에서 추출한 정확한 July 좌표
  const svgRows = [
    {y:0,    x:[0.00,241.38,482.76,724.14]},
    {y:56,   x:[0.00,183.63,367.26,550.89]},
    {y:112,  x:[0.00,125.17,250.34,375.50]},
    {y:168,  x:[0.00,78.52,157.03,235.55]},
    {y:224,  x:[0.00,45.46,90.92,136.37]},
    {y:280,  x:[0.00,25.53,51.05,76.58]},
    {y:336,  x:[0.00,16.35,32.70,49.05]},
    {y:392,  x:[0.00,14.06,28.11,42.17]},
    {y:448,  x:[0.00,14.19,28.38,42.57]},
    {y:504,  x:[0.00,17.53,35.05,52.58]},
    {y:560,  x:[0.00,28.73,57.46,86.18]},
    {y:616,  x:[0.00,51.55,103.09,154.64]},
    {y:672,  x:[0.00,88.21,176.42,264.62]},
    {y:728,  x:[0.00,139.06,278.13,417.19]}
  ];
  
  if (!st.inited) {
    st.inited = true;
    st.t = 121.435;
    st.font = loadedFont;
    st.quotes = [];
    
    // Initialize quote particles
    for (let i = 0; i < SETTINGS.QuoteCount; i++) {
      const bounceType = p.random() < 0.6 ? 'bouncy' : 'falling';
      st.quotes.push({
        x: p.random(0, g.width),
        y: p.random(-SETTINGS.QuoteSpawnPad * 4, g.height),
        vx: p.random(-0.6, 0.6),
        vy: p.random(SETTINGS.QuoteSpeedMin, SETTINGS.QuoteSpeedMax),
        bounceType: bounceType,
        bounceEnergy: bounceType === 'bouncy' ? p.random(0.3, 1.2) : 0,
        bounceCount: 0,
        theta: p.random(p.TWO_PI),
        rnd: p.random(-1, 1),
        baseAngle: p.random(-p.PI, p.PI)
      });
    }
  }
  
  // Background
  g.background(SETTINGS.bg);
  
  // --- July Typography ---
  g.fill('#888888'); // kinetic text 회색
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(SETTINGS.FontSize);
  g.textAlign(p.LEFT, p.CENTER);
  
  const chars = SETTINGS.word.split('');
  const canvasCenter = g.width / 2;
  
  // kinetic wave: 각 행이 좌우로 부드럽게 움직임
  for (let idx = 0; idx < svgRows.length; idx++) {
    const row = svgRows[idx];
    const minX = p.min(...row.x);
    const maxX = p.max(...row.x);
    const rowCenter = (minX + maxX) / 2;
    const shift = canvasCenter - rowCenter;
    const wave = p.sin(st.t * 30.0 + idx * 0.35) * 24;
    
    for (let i = 0; i < chars.length && i < row.x.length; i++) {
      g.text(chars[i], row.x[i] + shift + wave, row.y);
    }
  }
  
  // --- Quote Rain Particles ---
  if (SETTINGS.EnableQuotes) {
    g.push();
    g.textAlign(p.CENTER, p.CENTER);
    g.textFont(st.font || 'IPAMincho Regular');
    g.textSize(SETTINGS.QuoteSize);
    g.fill('#000000', 180); // 기호는 검은색, 투명도 180
    
    const capY = g.height;
    const glyphHalf = SETTINGS.QuoteSize * 0.5;
    
    for (let pQuote of st.quotes) {
      // 바람/흔들림
      const wind = SETTINGS.QuoteWindAmp * (p.noise((pQuote.y + st.t * 110) * 0.002, (st.t + pQuote.theta) * SETTINGS.QuoteWindFreq) - 0.5);
      const drift = SETTINGS.QuoteDriftAmp * p.sin(st.t * p.TWO_PI * SETTINGS.QuoteDriftFreq + pQuote.theta);
      pQuote.vx += (wind * 0.08 + drift * 0.02);
      pQuote.vy += SETTINGS.QuoteGravity * 0.18;
      pQuote.vy = p.min(pQuote.vy, SETTINGS.QuoteTerminal);
      pQuote.x += pQuote.vx;
      pQuote.y += pQuote.vy;
      
      // 바닥에 튕기기
      if (pQuote.y + glyphHalf > capY) {
        pQuote.y = capY - glyphHalf;
        
        if (pQuote.bounceType === 'bouncy') {
          pQuote.vy = -pQuote.vy * pQuote.bounceEnergy;
          pQuote.bounceCount++;
          pQuote.bounceEnergy *= p.random(0.88, 0.98);
          
          if (pQuote.bounceCount > p.random(6, 12) || p.abs(pQuote.vy) < p.random(0.5, 1.5)) {
            pQuote.y = p.random(-SETTINGS.QuoteSpawnPad * 3, -10);
            pQuote.x = p.random(0, g.width);
            pQuote.vx = p.random(-0.6, 0.6);
            pQuote.vy = p.random(SETTINGS.QuoteSpeedMin, SETTINGS.QuoteSpeedMax);
            pQuote.bounceEnergy = p.random(0.3, 1.2);
            pQuote.bounceCount = 0;
          }
        } else {
          pQuote.y = p.random(-SETTINGS.QuoteSpawnPad * 3, -10);
          pQuote.x = p.random(0, g.width);
          pQuote.vx = p.random(-0.6, 0.6);
          pQuote.vy = p.random(SETTINGS.QuoteSpeedMin, SETTINGS.QuoteSpeedMax);
        }
      }
      
      // 좌우 벽 래핑
      if (pQuote.x < -10) pQuote.x = g.width + 10;
      if (pQuote.x > g.width + 10) pQuote.x = -10;
      
      // 회전 효과
      let angle = pQuote.baseAngle;
      angle += p.atan2(pQuote.vy, pQuote.vx) * 0.7;
      angle += pQuote.rnd * 0.7;
      angle += p.sin(st.t * 2 + pQuote.theta) * 0.5;
      
      g.push();
      g.translate(pQuote.x, pQuote.y);
      g.rotate(angle);
      g.text(SETTINGS.QuoteGlyph, 0, 0);
      g.pop();
    }
    g.pop();
  }
  
  st.t += SETTINGS.Speed;
};

/* ============= February (target 1) ============= */
drawFns['1'] = (p, g, st) => {
  // SVG에서 추출한 각 글자별 x, y, 문자 정보
  if (!st.inited) {
    st.inited = true;
    st.t = 29.778;
    st.font = loadedFont;
    st.dots = [];
    st.svgTextData = [
      [46.13, 31.00, 'f'], [78.40, 31.00, 'e'], [110.67, 31.00, 'b'], [142.94, 31.00, 'r'], [175.21, 31.00, 'u'], [207.48, 31.00, 'a'], [239.76, 31.00, 'r'], [272.03, 31.00, 'y'],
      [24.90, 46.50, 'f'], [63.22, 46.50, 'e'], [101.54, 46.50, 'b'], [139.86, 46.50, 'r'], [178.17, 46.50, 'u'], [216.49, 46.50, 'a'], [254.81, 46.50, 'r'], [293.13, 46.50, 'y'],
      [-2.02, 62.00, 'f'], [43.77, 62.00, 'e'], [89.57, 62.00, 'b'], [135.36, 62.00, 'r'], [181.16, 62.00, 'u'], [226.95, 62.00, 'a'], [272.75, 62.00, 'r'], [318.55, 62.00, 'y'],
      [29.96, 77.50, 'f'], [66.63, 77.50, 'e'], [103.31, 77.50, 'b'], [139.99, 77.50, 'r'], [176.66, 77.50, 'u'], [213.34, 77.50, 'a'], [250.01, 77.50, 'r'], [286.69, 77.50, 'y'],
      [50.44, 93.00, 'f'], [81.29, 93.00, 'e'], [112.13, 93.00, 'b'], [142.98, 93.00, 'r'], [173.83, 93.00, 'u'], [204.68, 93.00, 'a'], [235.53, 93.00, 'r'], [266.38, 93.00, 'y'],
      [67.08, 108.50, 'f'], [93.20, 108.50, 'e'], [119.33, 108.50, 'b'], [145.45, 108.50, 'r'], [171.58, 108.50, 'u'], [197.70, 108.50, 'a'], [223.83, 108.50, 'r'], [249.95, 108.50, 'y'],
      [81.33, 124.00, 'f'], [103.42, 124.00, 'e'], [125.51, 124.00, 'b'], [147.61, 124.00, 'r'], [169.70, 124.00, 'u'], [191.79, 124.00, 'a'], [213.88, 124.00, 'r'], [235.98, 124.00, 'y'],
      [93.78, 139.50, 'f'], [112.36, 139.50, 'e'], [130.95, 139.50, 'b'], [149.54, 139.50, 'r'], [168.12, 139.50, 'u'], [186.71, 139.50, 'a'], [205.30, 139.50, 'r'], [223.88, 139.50, 'y'],
      [104.71, 155.00, 'f'], [120.23, 155.00, 'e'], [135.76, 155.00, 'b'], [151.29, 155.00, 'r'], [166.82, 155.00, 'u'], [182.34, 155.00, 'a'], [197.87, 155.00, 'r'], [213.40, 155.00, 'y'],
      [114.29, 170.50, 'f'], [127.16, 170.50, 'e'], [140.03, 170.50, 'b'], [152.90, 170.50, 'r'], [165.77, 170.50, 'u'], [178.64, 170.50, 'a'], [191.51, 170.50, 'r'], [204.38, 170.50, 'y'],
      [122.63, 186.00, 'f'], [133.21, 186.00, 'e'], [143.80, 186.00, 'b'], [154.39, 186.00, 'r'], [164.98, 186.00, 'u'], [175.57, 186.00, 'a'], [186.15, 186.00, 'r'], [196.74, 186.00, 'y'],
      [129.78, 201.50, 'f'], [138.45, 201.50, 'e'], [147.11, 201.50, 'b'], [155.78, 201.50, 'r'], [164.45, 201.50, 'u'], [173.11, 201.50, 'a'], [181.78, 201.50, 'r'], [190.45, 201.50, 'y'],
      [135.78, 217.00, 'f'], [142.88, 217.00, 'e'], [149.98, 217.00, 'b'], [157.08, 217.00, 'r'], [164.17, 217.00, 'u'], [171.27, 217.00, 'a'], [178.37, 217.00, 'r'], [185.46, 217.00, 'y'],
      [140.64, 232.50, 'f'], [146.52, 232.50, 'e'], [152.39, 232.50, 'b'], [158.26, 232.50, 'r'], [164.13, 232.50, 'u'], [170.01, 232.50, 'a'], [175.88, 232.50, 'r'], [181.75, 232.50, 'y'],
      [144.32, 248.00, 'f'], [149.32, 248.00, 'e'], [154.31, 248.00, 'b'], [159.30, 248.00, 'r'], [164.29, 248.00, 'u'], [169.28, 248.00, 'a'], [174.27, 248.00, 'r'], [179.27, 248.00, 'y'],
      [146.77, 263.50, 'f'], [151.22, 263.50, 'e'], [155.67, 263.50, 'b'], [160.12, 263.50, 'r'], [164.57, 263.50, 'u'], [169.03, 263.50, 'a'], [173.48, 263.50, 'r'], [177.93, 263.50, 'y'],
      [143.53, 279.00, 'f'], [147.78, 279.00, 'e'], [152.03, 279.00, 'b'], [156.28, 279.00, 'r'], [160.53, 279.00, 'u'], [164.79, 279.00, 'a'], [169.04, 279.00, 'r'], [173.29, 279.00, 'y'],
      [143.35, 294.50, 'f'], [147.74, 294.50, 'e'], [152.13, 294.50, 'b'], [156.53, 294.50, 'r'], [160.92, 294.50, 'u'], [165.31, 294.50, 'a'], [169.70, 294.50, 'r'], [174.09, 294.50, 'y'],
      [141.94, 310.00, 'f'], [146.81, 310.00, 'e'], [151.68, 310.00, 'b'], [156.56, 310.00, 'r'], [161.43, 310.00, 'u'], [166.30, 310.00, 'a'], [171.17, 310.00, 'r'], [176.05, 310.00, 'y'],
      [139.27, 325.50, 'f'], [144.96, 325.50, 'e'], [150.66, 325.50, 'b'], [156.35, 325.50, 'r'], [162.05, 325.50, 'u'], [167.74, 325.50, 'a'], [173.44, 325.50, 'r'], [179.13, 325.50, 'y'],
      [135.32, 341.00, 'f'], [142.18, 341.00, 'e'], [149.04, 341.00, 'b'], [155.90, 341.00, 'r'], [162.76, 341.00, 'u'], [169.63, 341.00, 'a'], [176.49, 341.00, 'r'], [183.35, 341.00, 'y'],
      [130.09, 356.50, 'f'], [138.47, 356.50, 'e'], [146.84, 356.50, 'b'], [155.22, 356.50, 'r'], [163.60, 356.50, 'u'], [171.97, 356.50, 'a'], [180.35, 356.50, 'r'], [188.72, 356.50, 'y'],
      [123.58, 372.00, 'f'], [133.82, 372.00, 'e'], [144.07, 372.00, 'b'], [154.31, 372.00, 'r'], [164.55, 372.00, 'u'], [174.80, 372.00, 'a'], [185.04, 372.00, 'r'], [195.29, 372.00, 'y'],
      [115.76, 387.50, 'f'], [128.24, 387.50, 'e'], [140.71, 387.50, 'b'], [153.19, 387.50, 'r'], [165.66, 387.50, 'u'], [178.14, 387.50, 'a'], [190.61, 387.50, 'r'], [203.09, 387.50, 'y'],
      [106.61, 403.00, 'f'], [121.69, 403.00, 'e'], [136.77, 403.00, 'b'], [151.85, 403.00, 'r'], [166.94, 403.00, 'u'], [182.02, 403.00, 'a'], [197.10, 403.00, 'r'], [212.19, 403.00, 'y'],
      [96.02, 418.50, 'f'], [114.12, 418.50, 'e'], [132.21, 418.50, 'b'], [150.31, 418.50, 'r'], [168.40, 418.50, 'u'], [186.50, 418.50, 'a'], [204.59, 418.50, 'r'], [222.68, 418.50, 'y'],
      [83.87, 434.00, 'f'], [105.42, 434.00, 'e'], [126.97, 434.00, 'b'], [148.53, 434.00, 'r'], [170.08, 434.00, 'u'], [191.63, 434.00, 'a'], [213.18, 434.00, 'r'], [234.74, 434.00, 'y'],
      [69.87, 449.50, 'f'], [95.41, 449.50, 'e'], [120.94, 449.50, 'b'], [146.48, 449.50, 'r'], [172.01, 449.50, 'u'], [197.55, 449.50, 'a'], [223.08, 449.50, 'r'], [248.62, 449.50, 'y'],
      [53.50, 465.00, 'f'], [83.70, 465.00, 'e'], [113.89, 465.00, 'b'], [144.08, 465.00, 'r'], [174.28, 465.00, 'u'], [204.47, 465.00, 'a'], [234.67, 465.00, 'r'], [264.86, 465.00, 'y'],
      [33.43, 480.50, 'f'], [69.34, 480.50, 'e'], [105.25, 480.50, 'b'], [141.16, 480.50, 'r'], [177.07, 480.50, 'u'], [212.98, 480.50, 'a'], [248.88, 480.50, 'r'], [284.79, 480.50, 'y'],
      [3.02, 496.00, 'f'], [47.39, 496.00, 'e'], [91.75, 496.00, 'b'], [136.12, 496.00, 'r'], [180.49, 496.00, 'u'], [224.85, 496.00, 'a'], [269.22, 496.00, 'r'], [313.58, 496.00, 'y'],
      [22.11, 511.50, 'f'], [61.04, 511.50, 'e'], [99.97, 511.50, 'b'], [138.90, 511.50, 'r'], [177.83, 511.50, 'u'], [216.76, 511.50, 'a'], [255.69, 511.50, 'r'], [294.62, 511.50, 'y'],
      [44.81, 527.00, 'f'], [77.28, 527.00, 'e'], [109.75, 527.00, 'b'], [142.22, 527.00, 'r'], [174.69, 527.00, 'u'], [207.16, 527.00, 'a'], [239.63, 527.00, 'r'], [272.10, 527.00, 'y'],
      [62.58, 542.50, 'f'], [90.00, 542.50, 'e'], [117.43, 542.50, 'b'], [144.86, 542.50, 'r'], [172.29, 542.50, 'u'], [199.71, 542.50, 'a'], [227.14, 542.50, 'r'], [254.57, 542.50, 'y'],
      [77.59, 558.00, 'f'], [100.77, 558.00, 'e'], [123.95, 558.00, 'b'], [147.13, 558.00, 'r'], [170.31, 558.00, 'u'], [193.49, 558.00, 'a'], [216.66, 558.00, 'r'], [239.84, 558.00, 'y'],
      [90.63, 573.50, 'f'], [110.13, 573.50, 'e'], [129.64, 573.50, 'b'], [149.15, 573.50, 'r'], [168.65, 573.50, 'u'], [188.16, 573.50, 'a'], [207.67, 573.50, 'r'], [227.17, 573.50, 'y'],
      [102.05, 589.00, 'f'], [118.36, 589.00, 'e'], [134.67, 589.00, 'b'], [150.98, 589.00, 'r'], [167.28, 589.00, 'u'], [183.59, 589.00, 'a'], [199.90, 589.00, 'r'], [216.21, 589.00, 'y'],
      [112.07, 604.50, 'f'], [125.60, 604.50, 'e'], [139.13, 604.50, 'b'], [152.65, 604.50, 'r'], [166.18, 604.50, 'u'], [179.71, 604.50, 'a'], [193.24, 604.50, 'r'], [206.77, 604.50, 'y'],
      [120.80, 620.00, 'f'], [131.94, 620.00, 'e'], [143.07, 620.00, 'b'], [154.21, 620.00, 'r'], [165.35, 620.00, 'u'], [176.49, 620.00, 'a'], [187.62, 620.00, 'r'], [198.76, 620.00, 'y'],
      [128.32, 635.50, 'f'], [137.44, 635.50, 'e'], [146.55, 635.50, 'b'], [155.67, 635.50, 'r'], [164.78, 635.50, 'u'], [173.90, 635.50, 'a'], [183.01, 635.50, 'r'], [192.13, 635.50, 'y'],
      [134.67, 651.00, 'f'], [142.12, 651.00, 'e'], [149.57, 651.00, 'b'], [157.02, 651.00, 'r'], [164.47, 651.00, 'u'], [171.93, 651.00, 'a'], [179.38, 651.00, 'r'], [186.83, 651.00, 'y'],
      [139.87, 666.50, 'f'], [146.01, 666.50, 'e'], [152.14, 666.50, 'b'], [158.28, 666.50, 'r'], [164.42, 666.50, 'u'], [170.55, 666.50, 'a'], [176.69, 666.50, 'r'], [182.83, 666.50, 'y'],
    ];
    // 콤마 rain 초기화
    for (let i = 0; i < 14; i++) {
      st.dots.push({
        x: p.random(g.width),
        y: p.random(0 - 40, g.height),
        vx: p.random(-0.6, 0.6),
        vy: p.random(0.9, 1.7),
        theta: p.random(p.TWO_PI),
        rnd: p.random(-1, 1),
        k: p.random(0.75, 1.35),
        alpha: 255,
      });
    }
  }
  g.background('#ffffff');
    g.fill('#888888'); // kinetic text 회색
  g.noStroke();
  g.textFont(st.font || 'serif');
  g.textSize(19);
  g.textAlign(p.LEFT, p.CENTER);
  // kinetic text (SVG 좌표 기반 + 웨이브)
  const delay = 0.08;
  const delayCurve = 0.62;
  const rowPhase = 0.149;
  const phase = 0;
  const speed = 0.0025;
  const gamma = 0.45;
  const amplitude = 22;
  let t0 = st.t + phase;
  for (let i = 0; i < st.svgTextData.length; i++) {
    const [x, y, ch] = st.svgTextData[i];
    let row = Math.floor(i / 8);
    let tChar = t0 - (i % 8) * delayCurve * delay - row * rowPhase;
    let ease = Math.pow(Math.abs(Math.sin(tChar)), gamma);
    let yOffset = -ease * amplitude;
    g.text(ch, x, y + yOffset);
  }
  st.t += 1/30;
  // 콤마 rain
  g.fill('#000000'); // 콤마는 검은색
  g.textSize(44);
  for (let pDot of st.dots) {
    const wind = 0.5 * (p.noise(pDot.y * 0.002, st.t * 0.1) - 0.5);
    const drift = 0.5 * Math.sin(st.t * p.TWO_PI * 0.1 + pDot.theta);
    pDot.vx += wind * 0.08 + drift * 0.02;
    pDot.vy += 0.5 * 0.07 * pDot.k;
    pDot.vy = Math.min(pDot.vy, 8 * pDot.k);
    pDot.x += pDot.vx;
    pDot.y += pDot.vy;
    if (pDot.vy < 0) {
      pDot.alpha -= 7;
    } else {
      pDot.alpha = Math.min(pDot.alpha + 5, 255);
    }
    let febEndY = 666.5;
    if (pDot.y > febEndY) {
      pDot.y = febEndY;
      pDot.vy = -p.random(2, 7);
      pDot.vx += p.random(-0.2, 0.2);
      pDot.alpha = 255;
    }
    if (pDot.alpha < 10) {
      pDot.y = -20;
      pDot.x = p.random(g.width);
      pDot.vx = p.random(-0.6, 0.6);
      pDot.vy = p.random(1.0, 2.2);
      pDot.alpha = 255;
    }
    if (pDot.y > g.height + 20) {
      pDot.y = -20; pDot.x = p.random(g.width);
      pDot.vx = p.random(-0.6, 0.6); pDot.vy = p.random(2.0, 4.2);
    }
    if (pDot.x < -10) pDot.x = g.width + 10;
    if (pDot.x > g.width + 10) pDot.x = -10;
    const ang = pDot.theta + st.t * 0.8;
    g.push();
    g.translate(pDot.x, pDot.y);
    g.rotate(ang);
    g.text(',', 0, 0);
    g.pop();
  }
};

/* ============= Placeholders for 2~11 ============= */

// ========== NOVEMBER (target 11) ========== //
drawFns['11'] = (p, g, st) => {
  // --- Settings ---
  const SETTINGS = {
    fg: '#000000',
    bg: '#ffffff',
    ParticleGlyph: '#',
    SlashGravity: 0.25,
    SlashDriftAmp: 0.6,
    SlashDriftFreq: 0.9,
    SlashWindAmp: 0.35,
    SlashWindFreq: 0.55,
    SlashTerminal: 12.0,
    SlashSpawnTopPad: 18,
    Speed: 0.001,
    FontSize: 27,
    TopMargin: 0,
    BottomMargin: 0,
    SideMargin: 29,
    StartValue: -34,
    EndValue: 47,
    Duration: 1.85,
    Delay: 0.08,
    Distance: 37,
    Gamma: 0.68,
    Phase: 0,
    RowPhase: 0,
    DelayCurve: 1
  };
  if (!st.inited) {
    st.inited = true;
    st.t = 0;
    st.dots = [];
    st.font = loadedFont;
    st.word = 'november';
    st.hashDots = [];
    st.hashPhase = 0;
    st.hashSprite = null;
    st.hashSpriteSize = 0;
    // 해시 파티클 초기화
    for (let i = 0; i < 25; i++) {
      st.hashDots.push({
        x: p.random(g.width),
        y: p.random(0 - SETTINGS.SlashSpawnTopPad, g.height),
        theta: p.random(p.TWO_PI),
        k: p.random(0.75, 1.35),
        vx: p.random(-0.6, 0.6),
        vy: p.random(2.2, 5.0),
        rnd: p.random(-1, 1),
        _angle: 0
      });
    }
  }
  // 배경
  g.background(SETTINGS.bg);
  // kinetic text (SVG 좌표 기반, 부드러운 모션)
  g.noStroke();
  g.fill('#cccccc');
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(SETTINGS.FontSize);
  g.textAlign(p.LEFT, p.CENTER);
  // SVG에서 추출한 각 행의 좌표 데이터 (간략화)
  const svgData = [
    {baseX: 39.91, baseY: 80.00, letters: [ {x:0.00,y:-72.98},{x:35.80,y:-63.46},{x:71.60,y:-48.26},{x:107.40,y:-28.76},{x:143.20,y:-6.68},{x:178.99,y:15.99},{x:214.79,y:37.23},{x:250.59,y:55.15} ]},
    {baseX: 55.72, baseY: 140.00, letters: [ {x:0.00,y:-61.10},{x:33.54,y:-45.01},{x:67.08,y:-24.91},{x:100.62,y:-2.58},{x:134.16,y:19.99},{x:167.70,y:40.76},{x:201.24,y:57.90},{x:234.78,y:69.86} ]},
    {baseX: 70.95, baseY: 200.00, letters: [ {x:0.00,y:-41.63},{x:31.36,y:-20.99},{x:62.73,y:1.54},{x:94.09,y:23.92},{x:125.46,y:44.17},{x:156.82,y:60.48},{x:188.19,y:71.38},{x:219.55,y:75.90} ]},
    {baseX: 82.78, baseY: 260.00, letters: [ {x:0.00,y:-17.00},{x:29.67,y:5.65},{x:59.35,y:27.79},{x:89.02,y:47.46},{x:118.70,y:62.88},{x:148.37,y:72.69},{x:178.04,y:76.00},{x:207.72,y:72.52} ]},
    {baseX: 89.79, baseY: 320.00, letters: [ {x:0.00,y:9.74},{x:28.67,y:31.58},{x:57.35,y:50.60},{x:86.02,y:65.10},{x:114.69,y:73.78},{x:143.37,y:75.87},{x:172.04,y:71.19},{x:200.71,y:60.15} ]},
    {baseX: 96.82, baseY: 380.00, letters: [ {x:0.00,y:35.27},{x:27.67,y:53.59},{x:55.34,y:67.12},{x:83.00,y:74.66},{x:110.67,y:75.52},{x:138.34,y:69.64},{x:166.01,y:57.54},{x:193.68,y:40.30} ]},
    {baseX: 82.05, baseY: 440.00, letters: [ {x:0.00,y:56.43},{x:26.56,y:68.95},{x:53.12,y:75.32},{x:79.68,y:74.96},{x:106.24,y:67.90},{x:132.80,y:54.77},{x:159.35,y:36.76},{x:185.91,y:15.46} ]},
    {baseX: 51.27, baseY: 500.00, letters: [ {x:0.00,y:70.58},{x:25.54,y:75.76},{x:51.08,y:74.17},{x:76.61,y:65.95},{x:102.15,y:51.84},{x:127.69,y:33.10},{x:153.23,y:11.41},{x:178.77,y:-11.31} ]},
    {baseX: 37.91, baseY: 560.00, letters: [ {x:0.00,y:75.97},{x:24.77,y:73.16},{x:49.54,y:63.81},{x:74.32,y:48.76},{x:99.09,y:29.35},{x:123.86,y:7.32},{x:148.63,y:-15.36},{x:173.41,y:-36.67} ]},
    {baseX: 47.47, baseY: 620.00, letters: [ {x:0.00,y:71.94},{x:24.32,y:61.48},{x:48.64,y:45.53},{x:72.97,y:25.51},{x:97.29,y:3.22},{x:121.61,y:-19.36},{x:145.93,y:-40.22},{x:170.26,y:-57.48} ]},
    {baseX: 78.56, baseY: 680.00, letters: [ {x:0.00,y:58.97},{x:24.10,y:42.17},{x:48.20,y:21.60},{x:72.30,y:-0.90},{x:96.39,y:-23.31},{x:120.49,y:-43.65},{x:144.59,y:-60.09},{x:168.69,y:-71.15} ]},
    {baseX: 123.34, baseY: 740.00, letters: [ {x:0.00,y:38.69},{x:23.88,y:17.63},{x:47.76,y:-5.01},{x:71.64,y:-27.19},{x:95.52,y:-46.95},{x:119.40,y:-62.52},{x:143.28,y:-72.50},{x:167.16,y:-76.00} ]}
  ];
  const globalTime = p.millis() * 0.002;
  const breathingAmp = 15;
  const waveAmp = 10;
  for (let rowIndex = 0; rowIndex < svgData.length; rowIndex++) {
    const row = svgData[rowIndex];
    const rowPhase = rowIndex * 0.3;
    const rowTime = globalTime + rowPhase;
    const rowBreathing = Math.sin(rowTime * 1.2) * breathingAmp;
    const rowWave = Math.sin(rowTime * 1.8 + rowIndex * 0.4) * waveAmp;
    for (let letterIndex = 0; letterIndex < st.word.length && letterIndex < row.letters.length; letterIndex++) {
      const letter = st.word[letterIndex];
      const letterPos = row.letters[letterIndex];
      const letterPhase = letterIndex * 0.2;
      const letterTime = globalTime + rowPhase + letterPhase;
      const letterJitter = Math.sin(letterTime * 2.2) * 4;
      const letterFloat = Math.cos(letterTime * 1.5 + letterIndex * 0.5) * 3;
      const finalX = row.baseX + letterPos.x + letterJitter;
      const finalY = row.baseY + letterPos.y + rowBreathing + rowWave + letterFloat;
      g.text(letter, finalX, finalY);
    }
  }
  // 해시 coldwind (바람 효과)
  // coldwind 파라미터 (원본과 유사하게)
  const windStrength = 3.0;
  const windDirection = 25; // degree, 오른쪽 위로
  const gustIntensity = 2.0;
  const gustFrequency = 0.8;
  st.gustTimer = (st.gustTimer || 0) + gustFrequency * 0.02;
  const windAngle = p.radians(windDirection);
  const baseWindX = p.cos(windAngle) * windStrength;
  const baseWindY = p.sin(windAngle) * windStrength;
  const gustPower = (p.sin(st.gustTimer) + p.sin(st.gustTimer * 1.7) + p.sin(st.gustTimer * 2.3)) / 3;
  const gustMultiplier = 1 + gustPower * gustIntensity;
  const breathingPhase = p.sin(st.t * 0.8) * 0.3 + p.sin(st.t * 1.2) * 0.2;
  const breathingWindX = baseWindX * (1 + breathingPhase);
  const breathingWindY = baseWindY * (1 + breathingPhase * 0.5);
  const windForceX = breathingWindX * gustMultiplier;
  const windForceY = breathingWindY * gustMultiplier;
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(28);
  g.fill(SETTINGS.fg);
  g.textAlign(p.CENTER, p.BASELINE);
  for (let pDot of st.hashDots) {
    // 바람 효과 적용
    pDot.vx += windForceX * 0.03;
    pDot.vy += windForceY * 0.03;
    // 돌풍 시 추가 랜덤 효과
    if (Math.abs(gustPower) > 0.5) {
      pDot.vx += (p.noise(pDot.x * 0.01, st.t * 0.5) - 0.5) * gustIntensity * 0.5;
      pDot.vy += (p.noise(pDot.y * 0.01, st.t * 0.5 + 100) - 0.5) * gustIntensity * 0.3;
    }
    // 기본 중력 (약하게)
    pDot.vy += SETTINGS.SlashGravity * 0.08 * pDot.k;
    // 공기 저항
    pDot.vx *= 0.98;
    pDot.vy *= 0.98;
    // 터미널 속도 제한
    const maxSpeed = SETTINGS.SlashTerminal * pDot.k * 1.5;
    const currentSpeed = Math.sqrt(pDot.vx * pDot.vx + pDot.vy * pDot.vy);
    if (currentSpeed > maxSpeed) {
      pDot.vx = (pDot.vx / currentSpeed) * maxSpeed;
      pDot.vy = (pDot.vy / currentSpeed) * maxSpeed;
    }
    pDot.x += pDot.vx;
    pDot.y += pDot.vy;
    // 래핑/리스폰 (바람 방향 고려)
    if (pDot.y > g.height + 20) {
      pDot.y = 0 - SETTINGS.SlashSpawnTopPad;
      pDot.x = p.random(0, g.width);
      pDot.vx = baseWindX * 0.3 + p.random(-0.5, 0.5);
      pDot.vy = p.random(1.0, 3.0);
    }
    if (windDirection > 0) {
      if (pDot.x > g.width + 30) {
        pDot.x = -20;
        pDot.y = p.random(0, g.height * 0.8);
      }
    } else {
      if (pDot.x < -30) {
        pDot.x = g.width + 20;
        pDot.y = p.random(0, g.height * 0.8);
      }
    }
    if (pDot.x < -50) pDot.x = g.width + 30;
    if (pDot.x > g.width + 50) pDot.x = -30;
    // 해시 기호 그리기 (바람에 흔들리는 효과)
    g.push();
    g.translate(Math.round(pDot.x), Math.round(pDot.y));
    const windRotation = Math.atan2(pDot.vy || 0, pDot.vx || 0) + Math.sin(st.t * 5 + pDot.theta) * 0.1;
    g.rotate(windRotation);
    const gustScale = 1 + Math.abs(gustPower) * 0.1;
    g.scale(gustScale);
    g.text('#', 0, 0);
    g.pop();
  }
  st.t += SETTINGS.Speed;
};

// ========== DECEMBER (target 12) ========== //
drawFns['12'] = (p, g, st) => {
  // --- Settings ---
  const SETTINGS = {
    fg: '#000000',
    bg: '#ffffff',
    StarGlyph: '*',
    BigStarSize: 60,
    SmallStarSize: 36,
    StarCount: 25,
    BigStarBlink: 2.0,
    SmallStarBlink: 3.0,
    FontSize: 16
  };
  
  if (!st.inited) {
    st.inited = true;
    st.t = 0;
    st.stars = [];
    st.font = loadedFont;
    
    // 위쪽 큰 별 (고정 위치)
    st.bigStar = {
      x: g.width * 0.50,
      y: g.height * 0.01,
      size: SETTINGS.BigStarSize,
      blinkPhase: 0,
      blinkSpeed: SETTINGS.BigStarBlink
    };
    
    // 작은 별들 초기화 (DECEMBER 텍스트 영역 피해서)
    for (let i = 0; i < SETTINGS.StarCount; i++) {
      let x, y, attempts = 0;
      do {
        x = p.random(20, g.width - 20);
        y = p.random(g.height * 0.15, g.height - 20);
        attempts++;
        
        // DECEMBER 텍스트 중앙 영역 피하기
        const textCenterX = g.width / 2;
        const textCenterY = g.height * 0.12;
        const textWidth = g.width * 0.6;
        const textHeight = g.height * 0.08;
        const inTextArea = (
          x > textCenterX - textWidth/2 &&
          x < textCenterX + textWidth/2 &&
          y > textCenterY - textHeight/2 &&
          y < textCenterY + textHeight/2
        );
        if (!inTextArea || attempts >= 50) break;
      } while (true);
      
      st.stars.push({
        x,
        y,
        blinkPhase: p.random(p.TWO_PI),
        blinkSpeed: p.random(1.2, 5.0),
        baseSize: p.random(0.5, 1.0),
        twinkleAmp: p.random(0.25, 0.3)
      });
    }
  }
  
  // 배경
  g.background(SETTINGS.bg);
  
  // --- 별 애니메이션 ---
  const col = p.color(SETTINGS.fg);
  g.push();
  g.textAlign(p.CENTER, p.CENTER);
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  
  // 큰 별 (위쪽 고정, 반짝임)
  st.bigStar.blinkPhase += st.bigStar.blinkSpeed * 0.1;
  const bigBlink = 0.3 + 0.7 * (0.5 + 0.5 * p.sin(st.bigStar.blinkPhase));
  g.textSize(st.bigStar.size);
  g.fill(p.red(col), p.green(col), p.blue(col), 255 * bigBlink);
  g.text(SETTINGS.StarGlyph, st.bigStar.x, st.bigStar.y);
  
  // 작은 별들 (반짝반짝 떨어지기)
  for (let i = 0; i < st.stars.length; i++) {
    let pStar = st.stars[i];
    
    // Y축으로 천천히 내림, X축으로 살짝 흔들림
    pStar.y += 0.7 + 0.5 * p.sin(st.t * 0.7 + i);
    pStar.x += p.sin(st.t * 0.5 + i * 0.3) * 0.3;
    
    // 아래로 벗어나면 위로 리스폰
    if (pStar.y > g.height + 20) {
      pStar.y = p.random(-30, -10);
      pStar.x = p.random(20, g.width - 20);
    }
    
    // 반짝임
    pStar.blinkPhase += pStar.blinkSpeed * 0.1;
    const twinkle = pStar.baseSize + pStar.twinkleAmp * (0.5 + 0.5 * p.sin(pStar.blinkPhase));
    const alpha = 100 + 155 * (0.5 + 0.5 * p.cos(pStar.blinkPhase * 1.3));
    
    g.textSize(SETTINGS.SmallStarSize * twinkle);
    g.fill(p.red(col), p.green(col), p.blue(col), alpha);
    g.text(SETTINGS.StarGlyph, pStar.x, pStar.y);
  }
  g.pop();
  
  // --- DECEMBER 타이포그래피 (SVG 좌표 기반 + wave) ---
  g.push();
  g.textAlign(p.LEFT, p.CENTER);
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(SETTINGS.FontSize);
  
  const decemberLines = [
    [{x:138.68,y:23.86,char:'D'},{x:144.38,y:32.53,char:'E'},{x:150.08,y:39.41,char:'C'},{x:155.78,y:44.00,char:'E'},{x:161.48,y:44.00,char:'M'},{x:167.18,y:39.41,char:'B'},{x:172.88,y:32.53,char:'E'},{x:178.58,y:23.86,char:'R'}],
    [{x:123.79,y:55.00,char:'D'},{x:133.74,y:64.23,char:'E'},{x:143.70,y:71.55,char:'C'},{x:153.65,y:76.44,char:'E'},{x:163.61,y:76.44,char:'M'},{x:173.56,y:71.55,char:'B'},{x:183.52,y:64.23,char:'E'},{x:193.47,y:55.00,char:'R'}],
    [{x:108.41,y:86.90,char:'D'},{x:122.76,y:96.38,char:'E'},{x:137.11,y:103.89,char:'C'},{x:151.46,y:108.91,char:'E'},{x:165.80,y:108.91,char:'M'},{x:180.15,y:103.89,char:'B'},{x:194.50,y:96.38,char:'E'},{x:208.85,y:86.90,char:'R'}],
    [{x:92.80,y:119.07,char:'D'},{x:111.61,y:128.68,char:'E'},{x:130.42,y:136.30,char:'C'},{x:149.23,y:141.40,char:'E'},{x:168.03,y:141.40,char:'M'},{x:186.84,y:136.30,char:'B'},{x:205.65,y:128.68,char:'E'},{x:224.46,y:119.07,char:'R'}],
    [{x:77.16,y:151.36,char:'D'},{x:100.44,y:161.06,char:'E'},{x:123.71,y:168.75,char:'C'},{x:146.99,y:173.89,char:'E'},{x:170.27,y:173.89,char:'M'},{x:193.55,y:168.75,char:'B'},{x:216.82,y:161.06,char:'E'},{x:240.10,y:151.36,char:'R'}],
    [{x:61.65,y:183.71,char:'D'},{x:89.36,y:193.47,char:'E'},{x:117.07,y:201.21,char:'C'},{x:144.78,y:206.38,char:'E'},{x:172.48,y:206.38,char:'M'},{x:200.19,y:201.21,char:'B'},{x:227.90,y:193.47,char:'E'},{x:255.61,y:183.71,char:'R'}],
    [{x:46.43,y:216.11,char:'D'},{x:78.49,y:225.91,char:'E'},{x:110.55,y:233.68,char:'C'},{x:142.60,y:238.87,char:'E'},{x:174.66,y:238.87,char:'M'},{x:206.71,y:233.68,char:'B'},{x:238.77,y:225.91,char:'E'},{x:270.83,y:216.11,char:'R'}],
    [{x:31.64,y:248.53,char:'D'},{x:67.92,y:258.37,char:'E'},{x:104.20,y:266.16,char:'C'},{x:140.49,y:271.37,char:'E'},{x:176.77,y:271.37,char:'M'},{x:213.06,y:266.16,char:'B'},{x:249.34,y:258.37,char:'E'},{x:285.62,y:248.53,char:'R'}],
    [{x:17.39,y:280.97,char:'D'},{x:57.74,y:290.83,char:'E'},{x:98.10,y:298.65,char:'C'},{x:138.45,y:303.87,char:'E'},{x:178.81,y:303.87,char:'M'},{x:219.16,y:298.65,char:'B'},{x:259.52,y:290.83,char:'E'},{x:299.87,y:280.97,char:'R'}],
    [{x:3.80,y:313.43,char:'D'},{x:48.04,y:323.31,char:'E'},{x:92.27,y:331.14,char:'C'},{x:136.51,y:336.37,char:'E'},{x:180.75,y:336.37,char:'M'},{x:224.99,y:331.14,char:'B'},{x:269.22,y:323.31,char:'E'},{x:313.46,y:313.43,char:'R'}],
    [{x:-9.02,y:345.89,char:'D'},{x:38.88,y:355.79,char:'E'},{x:86.78,y:363.63,char:'C'},{x:134.68,y:368.86,char:'E'},{x:182.58,y:368.86,char:'M'},{x:230.48,y:363.63,char:'B'},{x:278.38,y:355.79,char:'E'},{x:326.28,y:345.89,char:'R'}],
    [{x:-20.97,y:378.36,char:'D'},{x:30.35,y:388.27,char:'E'},{x:81.66,y:396.12,char:'C'},{x:132.97,y:401.36,char:'E'},{x:184.29,y:401.36,char:'M'},{x:235.60,y:396.12,char:'B'},{x:286.91,y:388.27,char:'E'},{x:338.23,y:378.36,char:'R'}],
    [{x:-31.96,y:410.84,char:'D'},{x:22.49,y:420.75,char:'E'},{x:76.95,y:428.61,char:'C'},{x:131.40,y:433.86,char:'E'},{x:185.86,y:433.86,char:'M'},{x:240.31,y:428.61,char:'B'},{x:294.77,y:420.75,char:'E'},{x:349.22,y:410.84,char:'R'}],
    [{x:-41.92,y:443.32,char:'D'},{x:15.38,y:453.24,char:'E'},{x:72.68,y:461.11,char:'C'},{x:129.98,y:466.36,char:'E'},{x:187.28,y:466.36,char:'M'},{x:244.58,y:461.11,char:'B'},{x:301.88,y:453.24,char:'E'},{x:359.18,y:443.32,char:'R'}],
    [{x:-50.76,y:475.80,char:'D'},{x:9.06,y:485.73,char:'E'},{x:68.89,y:493.60,char:'C'},{x:128.72,y:498.86,char:'E'},{x:188.54,y:498.86,char:'M'},{x:248.37,y:493.60,char:'B'},{x:308.20,y:485.73,char:'E'},{x:368.02,y:475.80,char:'R'}],
    [{x:-58.43,y:508.29,char:'D'},{x:3.58,y:518.22,char:'E'},{x:65.60,y:526.10,char:'C'},{x:127.62,y:531.36,char:'E'},{x:189.64,y:531.36,char:'M'},{x:251.66,y:526.10,char:'B'},{x:313.68,y:518.22,char:'E'},{x:375.69,y:508.29,char:'R'}],
    [{x:-64.87,y:540.78,char:'D'},{x:-1.02,y:550.72,char:'E'},{x:62.84,y:558.60,char:'C'},{x:126.70,y:563.86,char:'E'},{x:190.56,y:563.86,char:'M'},{x:254.42,y:558.60,char:'B'},{x:318.28,y:550.72,char:'E'},{x:382.13,y:540.78,char:'R'}],
    [{x:-70.04,y:573.27,char:'D'},{x:-4.70,y:583.21,char:'E'},{x:60.63,y:591.09,char:'C'},{x:125.96,y:596.36,char:'E'},{x:191.30,y:596.36,char:'M'},{x:256.63,y:591.09,char:'B'},{x:321.96,y:583.21,char:'E'},{x:387.30,y:573.27,char:'R'}],
    [{x:-73.88,y:605.77,char:'D'},{x:-7.45,y:615.71,char:'E'},{x:58.98,y:623.59,char:'C'},{x:125.41,y:628.86,char:'E'},{x:191.85,y:628.86,char:'M'},{x:258.28,y:623.59,char:'B'},{x:324.71,y:615.71,char:'E'},{x:391.14,y:605.77,char:'R'}],
    [{x:-76.39,y:638.26,char:'D'},{x:-9.24,y:648.21,char:'E'},{x:57.91,y:656.09,char:'C'},{x:125.06,y:661.36,char:'E'},{x:192.20,y:661.36,char:'M'},{x:259.35,y:656.09,char:'B'},{x:326.50,y:648.21,char:'E'},{x:393.65,y:638.26,char:'R'}],
    [{x:-77.54,y:670.76,char:'D'},{x:-10.06,y:680.71,char:'E'},{x:57.41,y:688.59,char:'C'},{x:124.89,y:693.86,char:'E'},{x:192.37,y:693.86,char:'M'},{x:259.85,y:688.59,char:'B'},{x:327.32,y:680.71,char:'E'},{x:394.80,y:670.76,char:'R'}],
    [{x:-77.32,y:703.26,char:'D'},{x:-9.91,y:713.21,char:'E'},{x:57.51,y:721.09,char:'C'},{x:124.92,y:726.36,char:'E'},{x:192.34,y:726.36,char:'M'},{x:259.75,y:721.09,char:'B'},{x:327.17,y:713.21,char:'E'},{x:394.58,y:703.26,char:'R'}]
  ];
  
  // SVG 크기에서 현재 캔버스 크기로 스케일 조정
  const svgWidth = 321.26;
  const svgHeight = 718.11;
  const scaleX = g.width / svgWidth;
  const scaleY = g.height / svgHeight;
  
  // 웨이브 효과를 위한 시간 계산
  const waveTime = p.frameCount * 0.05 + st.t * 0.5;
  
  // 각 줄의 DECEMBER 그리기
  for (let lineIndex = 0; lineIndex < decemberLines.length; lineIndex++) {
    const line = decemberLines[lineIndex];
    
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const charData = line[charIndex];
      const scaledX = charData.x * scaleX;
      const scaledY = charData.y * scaleY;
      
      // 웨이브 효과: Y축으로 움직임
      const wavePhase = waveTime + scaledX * 0.02 + lineIndex * 0.5;
      const waveOffset = p.sin(wavePhase) * 8;
      
      // 회색 고정
      g.fill('#888888');
      
      g.text(charData.char, scaledX, scaledY + waveOffset);
    }
  }
  g.pop();
  
  st.t += 0.016;
};

// ---------- 부트스트랩 ----------
window.addEventListener('DOMContentLoaded', () => {
  // 캔버스 참조/가시성 초기화
  IDS.forEach(id => {
    canvases[id] = document.getElementById(`canvas-${id}`);
    visible[id] = false;
    STATE[id] = {}; // 각 달별 상태 객체
    const c = canvases[id];
    c.width  = CANVAS_W;   // ← 반드시 설정
    c.height = CANVAS_H;   // ← 반드시 설정
    c.style.backgroundColor = 'transparent';
  });
  // (canvas-debug 디버그 캔버스 제거)
  // 디버깅: 1월(0번) 캔버스 항상 보이게
  //visible['0'] = true;

  // MindAR target 이벤트 연결
  IDS.forEach(id => {
    const el = document.getElementById(`target-${id}`);
    if (!el) return;
    el.addEventListener('targetFound', () => { visible[id] = true; });
    el.addEventListener('targetLost',  () => { visible[id] = false; });
  });

  // p5 시작
  new p5(mainSketch);
});

// ---------- p5 인스턴스 ----------
function mainSketch(p) {
  p.preload = function () {
    // 폰트 로드 (경로가 다르면 FONT_PATH 수정)
    loadedFont = p.loadFont(
      FONT_PATH,
      () => {},
      () => console.warn('⚠️ 폰트 로드 실패:', FONT_PATH)
    );
  };

  p.setup = function () {
    p.frameRate(30);
    // 오프스크린 그래픽 생성
    IDS.forEach(id => {
      const g = p.createGraphics(CANVAS_W, CANVAS_H);
      g.pixelDensity(1); // 네 코드 유지
      g.clear();
      layers[id] = g;
      // 기본 폰트/정렬(placeholder가 즉시 그리더라도 글꼴 세팅)
      g.textFont(loadedFont || 'serif');
      g.textAlign(p.LEFT, p.CENTER);
    });
  };

  p.draw = function () {
    // 한 프레임 진입 로그 (디버그용 — 필요시 주석)
    // console.log('p.draw frame', p.frameCount);
    // 보이는 타겟만 drawFn 호출
    IDS.forEach(id => {
      if (visible[id]) {
        if (drawFns[id]) {
          // 호출 로그 (문제 재현 시 활성화)
          // console.log('calling drawFn for', id);
          try { drawFns[id](p, layers[id], STATE[id]); } catch (e) { console.error('drawFn error', id, e); }
        } else {
          // console.warn('no drawFn for', id);
        }
      }
      // Graphics → HTMLCanvas 복사
      try {
        blit(layers[id], canvases[id]);
      } catch (e) {
        console.error('blit failed for', id, e);
      }
    });

    // debug canvas에 0번 레이어를 복사(디버깅용)
    if (canvases['debug'] && layers['0']) {
      try { blit(layers['0'], canvases['debug']); } catch (e) { /* noop */ }
    }
  };
}

// Graphics → 실제 <canvas> 복사
function blit(g, htmlCanvas) {
  if (!g || !htmlCanvas) return;
  // 콘솔 로그는 필요할 때만 활성화하세요 — 매우 빈번합니다
  // console.log("blit", g, htmlCanvas && htmlCanvas.id, htmlCanvas && htmlCanvas.width, htmlCanvas && htmlCanvas.height);
  const ctx = htmlCanvas.getContext('2d');
  try {
    ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
    ctx.drawImage(g.elt, 0, 0, htmlCanvas.width, htmlCanvas.height);
  } catch (err) {
    // 캔버스 taint(CORS) 또는 빈 g.elt 문제 등 다양한 원인으로 drawImage 실패 가능
    console.error('blit drawImage error for canvas', htmlCanvas && htmlCanvas.id, err);
    // 더 많은 진단 정보 출력
    try {
      console.log('g.elt exists?', !!g.elt, 'g.width/height', g.width, g.height, 'htmlCanvas w/h', htmlCanvas.width, htmlCanvas.height);
    } catch (e) {}
  }
}
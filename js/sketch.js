// ============= January (target 0, Dot Flow version) =============
(() => {
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
  const DOT_COUNT = 8;
  const DOT_SIZE = 100;
  const DOT_SPEED = 1.1;
  const WIND_SCALE = 0.002;
  const SWAY_FREQ = 0.8;

  drawFns['0'] = (p, g, st) => {
    if (!st.inited) {
      st.inited = true;
      st.t = 0;
      st.dots = [];
      st.font = loadedFont;
      // Dot 초기화
      for (let i = 0; i < DOT_COUNT; i++) {
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
        g.fill('#888888'); // 글씨는 회색
        g.noStroke();
        g.textFont(st.font || 'serif');
        g.textSize(SETTINGS.FontSize);
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
      const totalW = trackedTextWidth_p5(SETTINGS.word, tracking, g);
      const x = SETTINGS.SideMargin;
      drawTrackedText_p5(g, SETTINGS.word, x, y, tracking);
    }
    // flowing dots
    updateAndDrawDots_p5(p, g, st, SETTINGS, DOT_SIZE, DOT_SPEED, WIND_SCALE, SWAY_FREQ);
    st.t += SETTINGS.Speed;
  };

  // --- helpers (p5용) ---
  function drawTrackedText_p5(g, str, x, y, tracking) {
    let xpos = x;
    for (let i = 0; i < str.length; i++) {
      g.text(str[i], xpos, y);
      xpos += g.textWidth(str[i]) + tracking;
    }
  }
  function trackedTextWidth_p5(str, tracking, g) {
    let w = 0;
    for (let i = 0; i < str.length; i++) w += g.textWidth(str[i]);
    return w + tracking * (str.length - 1);
  }
  function updateAndDrawDots_p5(p, g, st, SETTINGS, DOT_SIZE, DOT_SPEED, WIND_SCALE, SWAY_FREQ) {
    g.fill(SETTINGS.fg);
        g.fill(0); // 점(dot)은 검정색
    g.noStroke();
    g.textSize(DOT_SIZE);
    const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
    const copies = p.constrain(Math.floor(usableH / SETTINGS.Distance), 1, 1200);
    const lastTextY = SETTINGS.TopMargin + (copies - 1) * SETTINGS.Distance;
    const textAreaBottom = lastTextY + SETTINGS.FontSize;
    const capY = textAreaBottom - DOT_SIZE * 0.5;
    for (let pt of st.dots) {
      const wind = p.noise(pt.y * WIND_SCALE, (st.t + pt.theta) * 0.2) - 0.5;
      const sway = Math.sin(pt.theta + st.t * SWAY_FREQ) * 0.6;
      const fall = (1.2 + 2.2 * Math.abs(Math.sin(p.PI * (st.t / SETTINGS.Duration) * 0.6))) * DOT_SPEED * pt.k;
      pt.x += wind * 3 + sway;
      pt.y += fall;
      if (pt.y > capY) {
        pt.y = SETTINGS.TopMargin - 10;
        pt.x = p.random(g.width);
      }
      if (pt.x < -10) pt.x = g.width + 10;
      if (pt.x > g.width + 10) pt.x = -10;
      const yDraw = Math.min(pt.y, capY);
      g.text('.', pt.x, yDraw);
    }
  }
})();
const drawFns = {};
// ...existing code...
// ...existing code...
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

// --- target 2: old February (SVG y좌표 + 웨이브 모션 + comma rain) ---
drawFns['2'] = (p, g, st) => {
  // 1회 초기화
  if (!st.inited) {
    st.inited = true;
    st.t = 0;
    st.dots = [];
    st.dotSprite = null;
    st.dotSpriteSize = 0;
    st.font = loadedFont;
    st.SVG_Y = [41,51,61,71,81,91,101,111,121,131,141,151,161,171,181,191,201,211,221,231,241,251,261,271,281,291,301,311,321,331,341,351,361,371,381,391,401,411,421,431,441,451,461,471,481,491,501,511,521,531,541,551,561,571,581,591,601,611,621,631,641,651,661,671,681];
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
    st.SlashSpawnTopPad = 40;
    st.SlashWindAmp = 0.5;
    st.SlashWindFreq = 0.1;
    st.SlashDriftAmp = 0.5;
    st.SlashDriftFreq = 0.1;
    st.SlashGravity = 0.5;
    st.SlashTerminal = 8;
    // dots 초기화
    for (let i = 0; i < 14; i++) {
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
  // kinetic text
  g.background('#ffffff');
  g.fill(0);
  g.noStroke();
  g.textFont(st.font || 'IPAMincho Regular');
  g.textSize(st.FontSize);
  g.textAlign(g.LEFT, g.CENTER);
  let now = p.millis() / 1000;
  let copies = st.SVG_Y.length;
  for (let idx = 0; idx < copies; idx++) {
    let rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
    let curvedDelay = st.Delay * Math.pow(rowFrac, st.DelayCurve);
    let timeWithDelay = (now + st.Phase + idx * st.RowPhase) - curvedDelay + st.Duration/2;
    let progressRaw = 1 - Math.abs(2 * fract(timeWithDelay / st.Duration) - 1);
    let progress = Math.pow(progressRaw, st.Gamma);
    let tracking = st.StartValue + progress * (st.EndValue - st.StartValue);
    let y = st.SVG_Y[idx] + st.Amplitude * (progress - 0.5);
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
  // comma rain
  // dotSprite 생성
  if (!st.dotSprite || st.dotSpriteSize !== 44) {
    const glyphSize = 44;
    const S2 = glyphSize * 2;
    st.dotSpriteSize = glyphSize;
    st.dotSprite = g.createGraphics(S2, S2);
    st.dotSprite.pixelDensity(1);
    st.dotSprite.clear();
    st.dotSprite.noStroke();
    st.dotSprite.fill(0);
    st.dotSprite.textFont(st.font || 'IPAMincho Regular, serif');
    st.dotSprite.textSize(glyphSize);
    st.dotSprite.textAlign(g.CENTER, g.BASELINE);
    const asc = st.dotSprite.textAscent(), desc = st.dotSprite.textDescent();
    const baseY = (S2 - (asc + desc)) / 2 + asc;
    st.dotSprite.text(',', S2 / 2, baseY);
  }
  g.push();
  g.tint(0, 0, 0, 255);
  for (let pDot of st.dots) {
    const wind = st.SlashWindAmp * (p.noise(pDot.y * 0.002, st.t * st.SlashWindFreq) - 0.5);
    const drift = st.SlashDriftAmp * Math.sin(st.t * p.TWO_PI * st.SlashDriftFreq + pDot.theta);
    pDot.vx += wind * 0.08 + drift * 0.02;
    pDot.vy += st.SlashGravity * 0.07 * pDot.k;
    pDot.vy = Math.min(pDot.vy, st.SlashTerminal * pDot.k);
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
    g.imageMode(g.CENTER);
    g.tint(0, 0, 0, pDot.alpha);
    g.image(st.dotSprite, 0, 0);
    g.pop();
  }
  g.pop();
  st.t += 1/30;
};
// ---------- 공통 설정 ----------
const IDS = Array.from({ length: 12 }, (_, i) => i.toString()); // "0"..."11"
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

// --- target 3: March (slash rain) ---
drawFns['3'] = (p, g, st) => {
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
  g.fill(S.fg);
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
    st.dotSprite = g.createGraphics(S2, S2);
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
// ...existing code...


/* ============= February (target 1) ============= */
(() => {
    // --- Settings ---
  const SETTINGS = {
    fg: "#000000",
    bg: "#ffffff",
    ParticleGlyph: ",",      // "/" → "," (원본은 콤마)
    ParticleCount: 50,       // 20 → 50 (원본 값)
    ParticleSize: 45,        // 38 → 45 (원본 값)
    TextSize: 19,            // 25 → 19 (원본 값)
    TopMargin: 62,           // 6 → 62 (원본 값)
    BottomMargin: 49,        // 0 → 49 (원본 값)
    Distance: 31,            // 39 → 31 (원본 값)
    RainGravity: 0.45,       // 0.85 → 0.45 (원본 값)
    RainWindAmp: 0.9,        // 0.35 → 0.9 (원본 값)
    RainWindFreq: 0.7,       // 0.55 → 0.7 (원본 값)
    RainTerminal: 9.0,       // 12.0 → 9.0 (원본 값)
    RainRespawnTopPad: 12    // 18 → 12 (원본 값)
  };

  // state 구조: { t, particles:[...], inited:boolean }
  function initParticles(p, g, st, n) {
    st.particles = [];
    for (let i = 0; i < n; i++) {
      st.particles.push({
        x: p.random(g.width),
        y: p.random(-50, g.height),
        vy: p.random(1, 3)
      });
    }
  }

  function updateAndDrawParticles(p, g, st) {
    g.fill(SETTINGS.fg);
    g.noStroke();
    g.textSize(SETTINGS.ParticleSize);  // 다시 ParticleSize 사용  // ParticleSize 대신 텍스트와 같은 크기 사용

    for (let i = 0; i < st.particles.length; i++) {
      let pt = st.particles[i];
      pt.y += pt.vy;
      if (pt.y > g.height + 20) {
        pt.y = p.random(-50, -10);
        pt.x = p.random(g.width);
        pt.vy = p.random(1, 3);
      }
      g.text(SETTINGS.ParticleGlyph, pt.x, pt.y);
    }
  }

  function drawTrackedTextSimple(g, str, x, y, tracking) {
    let xpos = x;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      g.text(ch, xpos, y);
      xpos += g.textWidth(ch) + tracking;
    }
  }

  function triangle(x) {
    return 1 - Math.abs(2 * (x - Math.floor(x)) - 1);
  }

  drawFns['1'] = (p, g, st) => {
    // --- FEB kinetic text (SVG 좌표 기반 + 웨이브 모션 + 콤마 rain) ---
    if (!st.inited) {
      st.inited = true;
      st.t = 0;
      st.dots = [];
      st.font = loadedFont;
      st.ParticleGlyph = ',';
      st.ParticleCount = 14;
      st.SlashSpawnTopPad = 40;
      // 콤마 rain 초기화
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
    }
    g.background('#ffffff');
    g.fill(0);
    g.noStroke();
    g.textFont(st.font || 'serif');
    g.textSize(19);
    g.textAlign(p.LEFT, p.CENTER);
    // kinetic text (SVG 좌표 기반 + 웨이브, y좌표 정규화)
    // --- 간격 조정 ---
    const svgYs = st.svgTextData.map(d => d[1]);
    const minY = Math.min(...svgYs);
    const maxY = Math.max(...svgYs);
    const pad = 40; // 위쪽 패딩 (기존보다 크게)
    const bottomPad = 40; // 아래쪽 패딩 (기존보다 크게)
    const availH = g.height - pad - bottomPad;
    const yScale = availH / (maxY - minY);
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
      // y좌표 정규화 적용
      let normY = pad + (y - minY) * yScale;
      g.text(ch, x, normY + yOffset);
    }
    st.t += 1/30; // 움직임 활성화 (30fps 기준)
    // 콤마 rain
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
    // st.t += 1/30; // 움직임 비활성화
  };
})();

/* ============= Placeholders for 2~11 ============= */
// 필요해지면 아래처럼 추가하세요:
// drawFns['2'] = (p, g, st) => { /* March 코드 */ };
// ...
// drawFns['11'] = (p, g, st) => { /* December 코드 */ };

// ---------- 부트스트랩 ----------
window.addEventListener('DOMContentLoaded', () => {
  // 캔버스 참조/가시성 초기화
  IDS.forEach(id => {
    canvases[id] = document.getElementById(`canvas-${id}`);
    visible[id] = false;
    STATE[id] = {}; // 각 달별 상태 객체
    const c = canvases[id];
    if (c) {
      c.width  = CANVAS_W;   // ← 반드시 설정
      c.height = CANVAS_H;   // ← 반드시 설정
      c.style.backgroundColor = 'transparent';
    }
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
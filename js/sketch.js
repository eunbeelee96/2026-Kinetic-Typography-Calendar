const drawFns = {};
// ...existing code...
    g.drawingContext.imageSmoothingEnabled = true;
    for (let p of dots) {
      // 빠른 하강 + 사선 흔들림 + 미세 바람
      const wind = SETTINGS.SlashWindAmp * (g.noise((p.y + t * 110) * 0.002, (t + p.theta) * SETTINGS.SlashWindFreq) - 0.5);
      const drift = SETTINGS.SlashDriftAmp * Math.sin(t * g.TWO_PI * SETTINGS.SlashDriftFreq + p.theta);
      p.vx += (wind * 0.08 + drift * 0.02);
      p.vy += SETTINGS.SlashGravity * 0.18 * p.k;
      p.vy = Math.min(p.vy, SETTINGS.SlashTerminal * p.k);
      p.x += p.vx;
      p.y += p.vy;
      // 래핑/리스폰 - 텍스트 마지막 줄과 맞춤
      const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
      const copies = g.constrain(Math.floor(usableH / SETTINGS.Distance), 1, 1200);
      const lastRowY = SETTINGS.TopMargin + (copies - 1) * SETTINGS.Distance + SETTINGS.FontSize;
      const capY = lastRowY - (dotSprite ? dotSpriteBottomOffset : 0);
      if (p.y > capY) {
        p.y = 0 - SETTINGS.SlashSpawnTopPad;
        p.x = g.random(0, g.width);
        p.vx = g.random(-0.6, 0.6);
        p.vy = g.random(2.0, 4.2);
      }
      if (p.x < -10)  p.x = g.width + 10;
      if (p.x > g.width + 10) p.x = -10;
      // 회전 각도: 낙하 속도 기반
      p._angle = computeParticleAngle(p, g);
      g.push();
      const drawY = Math.min(p.y, capY);
      g.translate(Math.round(p.x), Math.round(drawY));
      if (p._angle !== 0) g.rotate(p._angle);
      g.image(dotSprite, 0, 0);
      g.pop();
    }
    g.pop();
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
    if (!st.inited) {
      st.inited = true;
      st.t = 0;
      initParticles(p, g, st, SETTINGS.ParticleCount);
      g.textFont(loadedFont || 'serif');
      g.textAlign(p.LEFT, p.CENTER);
      g.pixelDensity(2);
    }

    g.background(SETTINGS.bg);
    
    // February 텍스트 (원본 스타일로)
    g.fill(SETTINGS.fg);
    g.noStroke();
    g.textSize(SETTINGS.TextSize);  // 25px
    
    const word = "february";
    const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
    const copies = Math.max(1, Math.floor(usableH / SETTINGS.Distance));
    
    for (let idx = 0; idx < copies; idx++) {
      const timeWithDelay = st.t + idx * 0.149;  // 원본 RowPhase 값 (0.149)
      const progressRaw = triangle(timeWithDelay / 2.5);  // 원본 Duration 값 (2.5)
      const progress = Math.pow(progressRaw, 0.62);  // 원본 Gamma 값 (0.62)
      const tracking = 88 + progress * (-1 - 88);  // 원본 StartValue(88), EndValue(-1)
      const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
      const x = 0;  // SideMargin (0)
      drawTrackedTextSimple(g, word, x, y, tracking);
    }

    // 콤마 비 (원본 스타일)
    updateAndDrawParticles(p, g, st);

    // time step (원본 속도)
    st.t += 0.02;
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
        if (c) {
      c.width  = CANVAS_W;   // ← 반드시 설정
      c.height = CANVAS_H;   // ← 반드시 설정
      c.style.backgroundColor = 'transparent';
    }
  });
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
      g.pixelDensity(2); // 네 코드 유지
      g.clear();
      layers[id] = g;
      // 기본 폰트/정렬(placeholder가 즉시 그리더라도 글꼴 세팅)
      g.textFont(loadedFont || 'serif');
      g.textAlign(p.LEFT, p.CENTER);
    });
  };

  p.draw = function () {
    // 보이는 타겟만 drawFn 호출
    IDS.forEach(id => {
      if (visible[id] && drawFns[id]) {
        drawFns[id](p, layers[id], STATE[id]);
      }
      // Graphics → HTMLCanvas 복사
      blit(layers[id], canvases[id]);
    });
  };
}

// Graphics → 실제 <canvas> 복사
function blit(g, htmlCanvas) {
  if (!g || !htmlCanvas) return;
  console.log("blit", g, htmlCanvas);
  const ctx = htmlCanvas.getContext('2d');
  ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
  ctx.drawImage(g.elt, 0, 0, htmlCanvas.width, htmlCanvas.height);
}
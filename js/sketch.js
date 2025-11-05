// --- March (target 3) / slash rain kinetic type ---
drawFns['3'] = (function() {
  let font;
  const FONT_PATH = 'IPAMincho Regular.ttf';
  const FALLBACK_FONT = 'Suisse Intl Mono, Helvetica, Arial, monospace';
  let dotSpriteBottomOffset = 0;
  let t = 382.595;
  const SETTINGS = {
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
  let dots = [], dotPhase = 0, dotSprite = null, dotSpriteSize = 0;
  function preload(g) {
    try {
      font = g.loadFont(FONT_PATH);
    } catch (e) {
      font = null;
    }
  }
  function setup(g) {
    g.pixelDensity(2);
    if (font) {
      g.textFont(font);
    } else {
      g.textFont(FALLBACK_FONT);
    }
    g.textAlign(g.LEFT, g.CENTER);
    g.imageMode(g.CENTER);
    initDots(12, g);
    rebuildDotSprite(38, g);
  }
  function draw(g) {
    g.background(SETTINGS.bg);
    drawKineticHeader(g);
    ensureDotCount(g);
    updateAndDrawDots(g);
    t += SETTINGS.Speed;
    dotPhase += SETTINGS.Speed;
  }
  function drawKineticHeader(g) {
    g.fill(SETTINGS.fg);
    g.textSize(SETTINGS.FontSize);
    const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
    const copies = g.constrain(Math.floor(usableH / SETTINGS.Distance), 1, 1200);
    const phaseOff = SETTINGS.Phase * SETTINGS.Duration;
    for (let idx = 0; idx < copies; idx++) {
      const rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
      const curvedDelay = SETTINGS.Delay * Math.pow(rowFrac, SETTINGS.DelayCurve);
      const timeWithDelay = (t + phaseOff + idx * SETTINGS.RowPhase) - curvedDelay;
      const progressRaw = progressByMonth(SETTINGS.month, timeWithDelay, SETTINGS.Duration);
      const progress = Math.pow(progressRaw, SETTINGS.Gamma);
      const tracking = SETTINGS.StartValue + progress * (SETTINGS.EndValue - SETTINGS.StartValue);
      const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
      const totalW = trackedTextWidth(SETTINGS.word, tracking, g);
      let x;
      if (SETTINGS.align === 'center') x = g.width / 2 - totalW / 2;
      else if (SETTINGS.align === 'left') x = SETTINGS.SideMargin;
      else x = g.width - SETTINGS.SideMargin - totalW;
      drawTrackedText(SETTINGS.word, x, y, tracking, g);
    }
  }
  function initDots(n, g) {
    dots = [];
    g.noiseSeed(202604);
    g.randomSeed(202604);
    for (let i = 0; i < n; i++) {
      const angleDeg = g.random(-60, 60);
      dots.push({
        x: g.random(0, g.width),
        y: g.random(0 - SETTINGS.SlashSpawnTopPad, g.height),
        theta: g.random(g.TWO_PI),
        k: g.random(0.75, 1.35),
        vx: g.random(-0.6, 0.6),
        vy: g.random(2.2, 5.0),
        rnd: g.random(-1, 1),
        _angle: g.radians(angleDeg)
      });
    }
  }
  function ensureDotCount(g) {
    const target = 12;
    const diff = target - dots.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        const angleDeg = g.random(-60, 60);
        dots.push({
          x: g.random(0, g.width),
          y: g.random(0 - SETTINGS.SlashSpawnTopPad, g.height),
          theta: g.random(g.TWO_PI),
          k: g.random(0.75, 1.35),
          vx: g.random(-0.6, 0.6),
          vy: g.random(2.2, 5.0),
          rnd: g.random(-1, 1),
          _angle: g.radians(angleDeg)
        });
      }
    } else if (diff < 0) dots.splice(target);
  }
  function rebuildDotSprite(sizePx, g) {
    const glyphSize = Math.max(8, Math.floor(sizePx));
    const S = Math.floor(glyphSize * 2.0);
    if (dotSprite && dotSpriteSize === glyphSize && dotSprite.width === S) return;
    dotSpriteSize = glyphSize;
    dotSprite = g.createGraphics(S, S);
    dotSprite.pixelDensity(2);
    dotSprite.background(0, 0);
    dotSprite.noStroke();
    dotSprite.fill(0);
    dotSprite.textFont(font || FALLBACK_FONT);
    dotSprite.textSize(glyphSize);
    dotSprite.textAlign(g.CENTER, g.BASELINE);
    const asc = dotSprite.textAscent();
    const desc = dotSprite.textDescent();
    const H = asc + desc;
    const padY = (S - H) * 0.5;
    const cx = S * 0.5;
    const baseY = padY + asc;
    dotSprite.drawingContext.imageSmoothingEnabled = true;
    dotSprite.text(SETTINGS.ParticleGlyph || '/', cx, baseY);
    dotSpriteBottomOffset = (baseY + desc) - (S * 0.5);
  }
  function updateAndDrawDots(g) {
    const baseSize = 38;
    rebuildDotSprite(baseSize, g);
    g.push();
    const col = g.color(SETTINGS.fg);
    g.tint(g.red(col), g.green(col), g.blue(col), 255);
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
  }
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
  return {
    preload,
    setup,
    draw
  };
})();
// --- March (target 2) / SVG y좌표 + 웨이브 모션 + comma rain ---
drawFns['2'] = (function() {
  // SVG에서 추출한 각 행별 y좌표
  const svgY = [41,51,61,71,81,91,101,111,121,131,141,151,161,171,181,191,201,211,221,231,241,251,261,271,281,291,301,311,321,331,341,351,361,371,381,391,401,411,421,431,441,451,461,471,481,491,501,511,521,531,541,551,561,571,581,591,601,611,621,631,641,651,661,671,681];
  const word = "february";
  const FontSize = 19;
  const StartValue = 0;
  const EndValue = 260;
  const Duration = 4.0;
  const Delay = 0.08;
  const Gamma = 3;
  const Phase = 0;
  const RowPhase = 0.05;
  const DelayCurve = 1;
  const Amplitude = 50;
  let font;
  let dots = [], dotSprite, dotSpriteSize;
  let t = 0;
  const SlashSpawnTopPad = 40;
  const SlashWindAmp = 0.5;
  const SlashWindFreq = 0.1;
  const SlashDriftAmp = 0.5;
  const SlashDriftFreq = 0.1;
  const SlashGravity = 0.5;
  const SlashTerminal = 8;
  function preload(g) {
    try {
      font = g.loadFont(FONT_PATH);
    } catch (e) {
      font = null;
    }
  }
  function setup(g) {
    if (font) {
      g.textFont(font);
    } else {
      g.textFont('IPAMincho Regular');
    }
    g.textSize(FontSize);
    g.textAlign(g.LEFT, g.CENTER);
    initDots(14, g);
  }
  function draw(g) {
    g.background('#ffffff');
    drawFEBText(g);
    updateAndDrawSlashes(g);
    t += 1/30;
  }
  function drawFEBText(g) {
    g.fill(0);
    g.noStroke();
    if (font) {
      g.textFont(font);
    } else {
      g.textFont('IPAMincho Regular');
    }
    g.textSize(FontSize);
    g.textAlign(g.LEFT, g.CENTER);
    let now = g.millis() / 1000;
    let copies = svgY.length;
    for (let idx = 0; idx < copies; idx++) {
      let rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
      let curvedDelay = Delay * Math.pow(rowFrac, DelayCurve);
      let timeWithDelay = (now + Phase + idx * RowPhase) - curvedDelay + Duration/2;
      let progressRaw = 1 - Math.abs(2 * fract(timeWithDelay / Duration) - 1);
      let progress = Math.pow(progressRaw, Gamma);
      let tracking = StartValue + progress * (EndValue - StartValue);
      let y = svgY[idx] + Amplitude * (progress - 0.5);
      // 중앙정렬
      let totalW = 0;
      for (let i = 0; i < word.length; i++) totalW += g.textWidth(word[i]);
      totalW += tracking * (word.length - 1);
      let x = g.width / 2 - totalW / 2;
      let xpos = x;
      for (let i = 0; i < word.length; i++) {
        g.text(word[i], xpos, y);
        xpos += g.textWidth(word[i]) + tracking;
      }
    }
  }
  function fract(x) { return x - Math.floor(x); }
  function initDots(n, g) {
    dots = [];
    g.noiseSeed(202604); g.randomSeed(202604);
    for (let i = 0; i < n; i++) {
      dots.push({
        x: g.random(0, g.width),
        y: g.random(0 - SlashSpawnTopPad, g.height),
        vx: g.random(-0.6, 0.6),
        vy: g.random(0.9, 1.7),
        theta: g.random(g.TWO_PI),
        rnd: g.random(-1, 1),
        k: g.random(0.75, 1.35),
        alpha: 255,
      });
    }
  }
  function rebuildDotSprite(sizePx, g) {
    const glyphSize = Math.max(8, Math.floor(sizePx));
    const S2 = glyphSize * 2;
    if (dotSprite && dotSpriteSize === glyphSize && dotSprite.width === S2) return;
    dotSpriteSize = glyphSize;
    dotSprite = g.createGraphics(S2, S2);
    dotSprite.pixelDensity(1);
    dotSprite.clear();
    dotSprite.noStroke();
    dotSprite.fill(0);
    if (font) {
      dotSprite.textFont(font);
    } else {
      dotSprite.textFont('IPAMincho Regular, serif');
    }
    dotSprite.textSize(glyphSize);
    dotSprite.textAlign(g.CENTER, g.BASELINE);
    const asc = dotSprite.textAscent(), desc = dotSprite.textDescent();
    const baseY = (S2 - (asc + desc)) / 2 + asc;
    dotSprite.text(',', S2 / 2, baseY);
  }
  function updateAndDrawSlashes(g) {
    rebuildDotSprite(44, g);
    g.push();
    g.tint(0, 0, 0, 255);
    for (let p of dots) {
      const wind = SlashWindAmp * (g.noise(p.y * 0.002, t * SlashWindFreq) - 0.5);
      const drift = SlashDriftAmp * Math.sin(t * g.TWO_PI * SlashDriftFreq + p.theta);
      p.vx += wind * 0.08 + drift * 0.02;
      p.vy += SlashGravity * 0.07 * p.k;
      p.vy = Math.min(p.vy, SlashTerminal * p.k);
      p.x += p.vx;
      p.y += p.vy;
      if (p.vy < 0) {
        p.alpha -= 7;
      } else {
        p.alpha = Math.min(p.alpha + 5, 255);
      }
      let febEndY = 666.5;
      if (p.y > febEndY) {
        p.y = febEndY;
        p.vy = -g.random(2, 7);
        p.vx += g.random(-0.2, 0.2);
        p.alpha = 255;
      }
      if (p.alpha < 10) {
        p.y = -20;
        p.x = g.random(g.width);
        p.vx = g.random(-0.6, 0.6);
        p.vy = g.random(1.0, 2.2);
        p.alpha = 255;
      }
      if (p.y > g.height + 20) {
        p.y = -20; p.x = g.random(g.width);
        p.vx = g.random(-0.6, 0.6); p.vy = g.random(2.0, 4.2);
      }
      if (p.x < -10) p.x = g.width + 10;
      if (p.x > g.width + 10) p.x = -10;
      const ang = p.theta + t * 0.8;
      g.push();
      g.translate(p.x, p.y);
      g.rotate(ang);
      g.imageMode(g.CENTER);
      g.tint(0, 0, 0, p.alpha);
      g.image(dotSprite, 0, 0);
      g.pop();
    }
    g.pop();
  }
  return {
    preload,
    setup,
    draw
  };
})();
// ---------- 공통 설정 ----------
const IDS = Array.from({ length: 12 }, (_, i) => i.toString()); // "0"..."11"
const drawFns = {}; // drawFns['0'](p, g, state) 형태
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

// --- February / SVG 좌표 + 웨이브 모션 + comma rain ---
drawFns['1'] = (function() {
  // SVG에서 추출한 각 글자별 x, y, 문자 정보 (전체)
  const svgTextData = [
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
    [139.87, 666.50, 'f'], [146.01, 666.50, 'e'], [152.14, 666.50, 'b'], [158.28, 666.50, 'r'], [164.42, 666.50, 'u'], [170.55, 666.50, 'a'], [176.69, 666.50, 'r'], [182.83, 666.50, 'y']
  ];

  let font;
  const FONT_PATH = 'IPAMincho Regular.ttf';
  const FALLBACK = 'IPAMincho Regular, serif';
  // CANVAS_W, CANVAS_H는 전역 사용
  let t = 29.778;
  let S, dots = [], dotSprite, dotSpriteSize;

  function preload(g) {
    try {
      font = g.loadFont(FONT_PATH);
    } catch (e) {
      font = null;
    }
  }

  function setup(g) {
    // g.createCanvas(CANVAS_W, CANVAS_H); // 오프스크린에서 이미 생성됨
    if (font) {
      g.textFont(font);
    } else {
      g.textFont(FALLBACK);
    }
    S = {
      word: 'february',
      FontSize: 19,
      TopMargin: 31,
      BottomMargin: 0,
      SideMargin: 0,
      StartValue: 32.27,
      EndValue: 32.27,
      Distance: 15.5,
      Speed: 0,
      fg: '#000000',
      bg: '#ffffff',
      align: 'left',
      fontCSS: 'IPAMincho Regular',
      ParticleGlyph: ',',
      SlashSpawnTopPad: 40,
      SlashWindAmp: 0.5,
      SlashWindFreq: 0.1,
      SlashDriftAmp: 0.5,
      SlashDriftFreq: 0.1,
      SlashGravity: 0.5,
      SlashTerminal: 8
    };
    g.background(S.bg);
    initDots(14, g);
  }

  function draw(g) {
    g.background(S.bg);
    drawFEBText(g);
    updateAndDrawSlashes(g);
    t += 0.0025;
  }

  function drawFEBText(g) {
    g.fill(0);
    g.noStroke();
    if (font) {
      g.textFont(font);
    } else {
      g.textFont('IPAMincho Regular');
    }
    g.textSize(19);
    g.textAlign(g.LEFT, g.CENTER);
    const delay = 0.08;
    const delayCurve = 0.62;
    const rowPhase = 0.149;
    const phase = 0;
    const speed = 0.0025;
    const gamma = 0.45;
    const amplitude = 22;
    let t0 = g.millis() * speed + phase;
    for (let i = 0; i < svgTextData.length; i++) {
      const [x, y, ch] = svgTextData[i];
      let row = Math.floor(i / 8);
      let tChar = t0 - (i % 8) * delayCurve * delay - row * rowPhase;
      let ease = Math.pow(Math.abs(Math.sin(tChar)), gamma);
      let yOffset = -ease * amplitude;
      g.text(ch, x, y + yOffset);
    }
  }

  function initDots(n, g) {
    dots = [];
    g.noiseSeed(202604); g.randomSeed(202604);
    for (let i = 0; i < n; i++) {
      dots.push({
        x: g.random(0, g.width),
        y: g.random(0 - S.SlashSpawnTopPad, g.height),
        vx: g.random(-0.6, 0.6),
        vy: g.random(0.9, 1.7),
        theta: g.random(g.TWO_PI),
        rnd: g.random(-1, 1),
        k: g.random(0.75, 1.35),
        alpha: 255,
      });
    }
  }

  function rebuildDotSprite(sizePx, g) {
    const glyphSize = Math.max(8, Math.floor(sizePx));
    const S2 = glyphSize * 2;
    if (dotSprite && dotSpriteSize === glyphSize && dotSprite.width === S2) return;
    dotSpriteSize = glyphSize;
    dotSprite = g.createGraphics(S2, S2);
    dotSprite.pixelDensity(1);
    dotSprite.clear();
    dotSprite.noStroke();
    dotSprite.fill(0);
    if (font) {
      dotSprite.textFont(font);
    } else {
      dotSprite.textFont(FALLBACK);
    }
    dotSprite.textSize(glyphSize);
    dotSprite.textAlign(g.CENTER, g.BASELINE);
    const asc = dotSprite.textAscent(), desc = dotSprite.textDescent();
    const baseY = (S2 - (asc + desc)) / 2 + asc;
    dotSprite.text(S.ParticleGlyph, S2 / 2, baseY);
  }

  function updateAndDrawSlashes(g) {
    rebuildDotSprite(44, g);
    g.push();
    g.tint(0, 0, 0, 255);
    for (let p of dots) {
      const wind = S.SlashWindAmp * (g.noise(p.y * 0.002, t * S.SlashWindFreq) - 0.5);
      const drift = S.SlashDriftAmp * Math.sin(t * g.TWO_PI * S.SlashDriftFreq + p.theta);
      p.vx += wind * 0.08 + drift * 0.02;
      p.vy += S.SlashGravity * 0.07 * p.k;
      p.vy = Math.min(p.vy, S.SlashTerminal * p.k);
      p.x += p.vx;
      p.y += p.vy;
      if (p.vy < 0) {
        p.alpha -= 7;
      } else {
        p.alpha = Math.min(p.alpha + 5, 255);
      }
      let febEndY = 666.5;
      if (p.y > febEndY) {
        p.y = febEndY;
        p.vy = -g.random(2, 7);
        p.vx += g.random(-0.2, 0.2);
        p.alpha = 255;
      }
      if (p.alpha < 10) {
        p.y = -20;
        p.x = g.random(g.width);
        p.vx = g.random(-0.6, 0.6);
        p.vy = g.random(1.0, 2.2);
        p.alpha = 255;
      }
      if (p.y > g.height + 20) {
        p.y = -20; p.x = g.random(g.width);
        p.vx = g.random(-0.6, 0.6); p.vy = g.random(2.0, 4.2);
      }
      if (p.x < -10) p.x = g.width + 10;
      if (p.x > g.width + 10) p.x = -10;
      const ang = p.theta + t * 0.8;
      g.push();
      g.translate(p.x, p.y);
      g.rotate(ang);
      g.imageMode(g.CENTER);
      g.tint(0, 0, 0, p.alpha);
      g.image(dotSprite, 0, 0);
      g.pop();
    }
    g.pop();
  }

  // --- API for AR calendar system ---
  return {
    preload,
    setup,
    draw
  };

})();


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
  });
  // 디버깅: 1월(0번) 캔버스 항상 보이게
  visible['0'] = true;

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
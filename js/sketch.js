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
(() => {
  // --- Settings for January ---
  const SETTINGS = {
    fg: "#000000",
    bg: "#ffffff",
    word: "january",
    FontSize: 18,    // 60 → 18 (원본 크기)
    TopMargin: 12,   // 50 → 12 (원본 크기)  
    BottomMargin: 12, // 50 → 12 (원본 크기)
    SideMargin: 20,
    StartValue: 0,
    EndValue: 130,   // 180 → 130 (원본 값)
    Duration: 2.5,   // 3.2 → 2.5 (원본 값)
    Delay: 0.08,     // 0.05 → 0.08 (원본 값)
    Distance: 20,    // 56 → 20 (원본 값)
    Speed: 0.015,    // 0.02 → 0.015 (원본 값)
    Gamma: 1,        // 0.62 → 1 (원본 값)
    Phase: 0,
    RowPhase: 0.12,  // 0.149 → 0.12 (원본 값)
    DelayCurve: 1    // 0.62 → 1 (원본 값)
  };

  const DOT_COUNT = 8;     // 30 → 8 (원본 값)
  const DOT_SIZE = 100;    // 20 → 100 (원본 값)
  const DOT_SPEED = 1.1;   // 1.0 → 1.1 (원본 값)
  const WIND_SCALE = 0.002;
  const SWAY_FREQ = 0.8;   // 1.5 → 0.8 (원본 값)

  function initDots(p, g, st, n) {
    st.dots = [];
    for (let i = 0; i < n; i++) {
      st.dots.push({
        x: p.random(g.width),
        y: p.random(-50, g.height),
        theta: p.random(p.TWO_PI),
        k: p.random(0.8, 1.2)
      });
    }
  }

  function drawTrackedText(g, str, x, y, tracking) {
    let xpos = x;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      g.text(ch, xpos, y);
      xpos += g.textWidth(ch) + tracking;
    }
  }

  function updateAndDrawDots(p, g, st) {
    g.fill(SETTINGS.fg);
    g.noStroke();
    g.textSize(DOT_SIZE);

    // 텍스트 영역 계산
    const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
    const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
    const lastTextY = SETTINGS.TopMargin + (copies - 1) * SETTINGS.Distance;
    const textAreaBottom = lastTextY;

    for (let i = 0; i < st.dots.length; i++) {
      const d = st.dots[i];
      const wind = p.noise(d.y * WIND_SCALE, (st.t + d.theta) * 0.2) - 0.5;
      const sway = p.sin(d.theta + st.t * SWAY_FREQ) * 0.6;
      const fall = (1.2 + 2.2 * Math.abs(p.sin(p.PI * (st.t / SETTINGS.Duration) * 0.6))) * DOT_SPEED * d.k;
      d.x += wind * 3 + sway;
      d.y += fall;

      if (d.y > textAreaBottom) {
        d.y = SETTINGS.TopMargin - 10;
        d.x = p.random(g.width);
      }
      if (d.x < -10) d.x = g.width + 10;
      if (d.x > g.width + 10) d.x = -10;

      g.text('.', d.x, d.y);
    }
  }

  drawFns['0'] = (p, g, st) => {
    console.log("drawFns[0] 실행", g, st);
    if (!st.inited) {
      st.inited = true;
      st.t = 0;
      initDots(p, g, st, DOT_COUNT);
      // 텍스트/폰트 초기화
      g.textFont(loadedFont || 'serif');
      g.textAlign(p.LEFT, p.CENTER);
      g.pixelDensity(2);
    }

    g.background(SETTINGS.bg);

    // kinetic text
    g.fill(SETTINGS.fg);
    g.noStroke();
    g.textSize(SETTINGS.FontSize);
    const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
    const copies = p.constrain(p.floor(usableH / SETTINGS.Distance), 1, 1200);
    const phaseOff = SETTINGS.Phase * SETTINGS.Duration;

    for (let idx = 0; idx < copies; idx++) {
      const rowFrac = (copies > 1) ? idx / (copies - 1) : 0;
      const curvedDelay = SETTINGS.Delay * Math.pow(rowFrac, SETTINGS.DelayCurve);
      const timeWithDelay = (st.t + phaseOff + idx * SETTINGS.RowPhase) - curvedDelay;
      const progressRaw = Math.abs(p.sin(p.PI * (timeWithDelay / SETTINGS.Duration) * 0.6));
      const progress = Math.pow(progressRaw, SETTINGS.Gamma);
      const tracking = SETTINGS.StartValue + progress * (SETTINGS.EndValue - SETTINGS.StartValue);
      const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
      const x = SETTINGS.SideMargin;
      drawTrackedText(g, SETTINGS.word, x, y, tracking);
    }

    // flowing dots
    updateAndDrawDots(p, g, st);

    // time step
    st.t += SETTINGS.Speed;
  };
})();

/* ============= February (target 1) ============= */
(() => {
    // --- Settings ---
  const SETTINGS = {
    fg: "#000000",
    bg: "#ffffff",
    ParticleGlyph: "/",      // "," → "/" (원본은 슬래시)
    ParticleCount: 20,       // 50 → 20 (원본 값)
    ParticleSize: 38,        // 60 → 38 (원본 값)
    TextSize: 25,            // 60 → 25 (원본 값)
    TopMargin: 6,            // 추가 (원본 값)
    BottomMargin: 0,         // 추가 (원본 값)
    Distance: 39,            // 추가 (원본 값)
    RainGravity: 0.85,       // 0.45 → 0.85 (원본 값)
    RainWindAmp: 0.35,       // 0.9 → 0.35 (원본 값)
    RainWindFreq: 0.55,      // 0.7 → 0.55 (원본 값)
    RainTerminal: 12.0,      // 9.0 → 12.0 (원본 값)
    RainRespawnTopPad: 18    // 12 → 18 (원본 값)
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
      const timeWithDelay = st.t + idx * 0.069;  // 원본 RowPhase 값
      const progressRaw = triangle(timeWithDelay / 1.52);  // 원본 Duration 값
      const progress = Math.pow(progressRaw, 0.7);  // 원본 Gamma 값
      const tracking = 300 + progress * (26 - 300);  // 원본 StartValue, EndValue (큰 트래킹 → 작게)
      const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
      const x = 20;  // SideMargin
      drawTrackedTextSimple(g, word, x, y, tracking);
    }

    // 슬래시 비 (원본 스타일)
    updateAndDrawParticles(p, g, st);

    // time step (원본 속도)
    st.t += 0.028;
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
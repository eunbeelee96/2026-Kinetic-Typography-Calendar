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

/* ============= February (target 1) ============= */
(() => {
  // --- Settings ---
  const SETTINGS = {
    fg: "#000000",
    bg: "#ffffff",
    ParticleGlyph: ",",
    ParticleCount: 50,
    ParticleSize: 45,
    RainGravity: 0.45,
    RainWindAmp: 0.9,
    RainWindFreq: 0.7,
    RainTerminal: 9.0,
    RainRespawnTopPad: 12
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
    g.textSize(SETTINGS.ParticleSize);

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
    // 메인 텍스트 렌더링
    const fontSize   = sliders.FontSize.value();
    const topMargin  = sliders.TopMargin.value();
    const bottomMargin = sliders.BottomMargin.value();

    const startValue = sliders.StartValue.value();
    const endValue   = sliders.EndValue.value();
    const duration   = max(0.001, sliders.Duration.value());
    const delay      = sliders.Delay.value();
    const distance   = sliders.Distance.value();
    const timeStep   = sliders.Speed.value();

    const gamma      = sliders.Gamma.value();
    const phaseOff   = sliders.Phase.value() * duration;
    const rowPhase   = sliders.RowPhase.value();
    const delayCurve = sliders.DelayCurve.value();

    g.textSize(fontSize);

    const usableH = g.height - topMargin - bottomMargin;
    const copies = constrain(floor(usableH / distance), 1, 1200);

    for (let idx = 0; idx < copies; idx++) {
      const rowFrac = (copies>1) ? idx/(copies-1) : 0;
      const curvedDelay = delay * pow(rowFrac, delayCurve);
      const timeWithDelay = (t + phaseOff + idx * rowPhase) - curvedDelay;

      const progressRaw = progressByMonth(currentMonth, timeWithDelay, duration);
      const progress = pow(progressRaw, gamma);

      const tracking = startValue + progress * (endValue - startValue);
      const y = topMargin + idx * distance;

      const totalW = trackedTextWidth(wordStr, tracking);
      let x;

      if (sliders.UseMonthGrid && sliders.UseMonthGrid.checked()) {
        if (alignSelect && alignSelect.elt) alignSelect.elt.disabled = true;
        x = startXFromAnchor(totalW);
      } else {
        if (alignSelect && alignSelect.elt) alignSelect.elt.disabled = false;
        const align = alignSelect.value();
        x = calculateCreativeAlignment(align, totalW, idx, timeWithDelay, y, sideMargin);
      }

      // 간단한 텍스트 렌더링
      // console.log('drawTrackedText:', wordStr, x, y, tracking, 'fontSize:', fontSize, 'fg:', fgPicker.value());
      g.push();
      g.fill(fgPicker.value());
      drawTrackedText(g, wordStr, x, y, tracking);
      g.pop();
    }

    if (!paused) t += timeStep;

    if (recording) {
      if (frameIndex <= maxFrames) {
        saveCanvas(`frame_${nf(frameIndex, 4)}`, 'png');
        frameIndex++;
      } else {
        recording = false;
      }
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

/* ============= Placeholders for 1~11 ============= */
// 필요해지면 아래처럼 추가하세요:
// drawFns['1'] = (p, g, st) => { /* February 코드 */ };
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
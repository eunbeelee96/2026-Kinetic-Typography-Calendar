// ========== 공통 전역 ==========

// 1번 타겟만 사용
const IDS = ['1'];

// 드로우 함수 테이블
const drawFns = {};

// px 설정 (8.5cm x 19cm)
const PX_PER_CM = 96 / 2.54;
const CANVAS_W = Math.round(8.5 * PX_PER_CM);
const CANVAS_H = Math.round(19 * PX_PER_CM);

// 캔버스 / 레이어 / 상태
const canvases = {};   // { '1': HTMLCanvasElement }
const layers = {};     // { '1': p5.Graphics }
const visible = {};    // { '1': boolean }
const STATE = {};      // { '1': {...} }

// 폰트
const FONT_PATH = 'IPAMincho Regular.ttf';
let loadedFont = null;


// ============= February (target 1) =============
(() => {
  // --- Settings ---
  const SETTINGS = {
    fg: "#000000",
    bg: "#ffffff",
    ParticleGlyph: ",",      // 콤마
    ParticleCount: 50,
    ParticleSize: 45,
    TextSize: 19,
    TopMargin: 62,
    BottomMargin: 49,
    Distance: 31,
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

  // 실제 1번 타겟 렌더 함수
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

    // February 텍스트
    g.fill(SETTINGS.fg);
    g.noStroke();
    g.textSize(SETTINGS.TextSize);

    const word = "february";
    const usableH = g.height - SETTINGS.TopMargin - SETTINGS.BottomMargin;
    const copies = Math.max(1, Math.floor(usableH / SETTINGS.Distance));

    for (let idx = 0; idx < copies; idx++) {
      const timeWithDelay = st.t + idx * 0.149;     // RowPhase
      const progressRaw = triangle(timeWithDelay / 2.5); // Duration
      const progress = Math.pow(progressRaw, 0.62);      // Gamma
      const tracking = 88 + progress * (-1 - 88);        // StartValue → EndValue
      const y = SETTINGS.TopMargin + idx * SETTINGS.Distance;
      const x = 0; // 왼쪽 정렬
      drawTrackedTextSimple(g, word, x, y, tracking);
    }

    // 콤마 비
    updateAndDrawParticles(p, g, st);

    // 시간 진행
    st.t += 0.02;
  };
})();


// ---------- 부트스트랩 ----------
window.addEventListener('DOMContentLoaded', () => {
  // 캔버스 참조/가시성 초기화 (1번만)
  IDS.forEach(id => {
    const c = document.getElementById(`canvas-${id}`);
    canvases[id] = c;
    visible[id] = false;
    STATE[id] = {};
    if (c) {
      c.width  = CANVAS_W;
      c.height = CANVAS_H;
      c.style.backgroundColor = 'transparent';
    }
  });

  // MindAR target 이벤트 연결 (1번만)
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
    // 폰트 로드
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
      g.pixelDensity(1);
      g.clear();
      layers[id] = g;
      g.textFont(loadedFont || 'serif');
      g.textAlign(p.LEFT, p.CENTER);
    });
  };

  p.draw = function () {
    IDS.forEach(id => {
      if (visible[id]) {
        if (drawFns[id]) {
          try {
            drawFns[id](p, layers[id], STATE[id]);
          } catch (e) {
            console.error('drawFn error', id, e);
          }
        }
      }

      try {
        blit(layers[id], canvases[id]);
      } catch (e) {
        console.error('blit failed for', id, e);
      }
    });
  };
}

// Graphics → 실제 <canvas> 복사
function blit(g, htmlCanvas) {
  if (!g || !htmlCanvas) return;
  const ctx = htmlCanvas.getContext('2d');
  try {
    ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
    ctx.drawImage(g.elt, 0, 0, htmlCanvas.width, htmlCanvas.height);
  } catch (err) {
    console.error('blit drawImage error for canvas', htmlCanvas && htmlCanvas.id, err);
  }
}
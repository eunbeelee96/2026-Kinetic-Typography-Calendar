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
  // ===== FEB kinetic text (SVG 좌표 + 웨이브 모션) + 콤마 rain (함수 분리) =====

  function drawFEBText_p5(g, st, t) {
    // 일정한 행 간격으로 kinetic text를 배치 (SVG 좌표 대신)
    const word = 'february';
    const FontSize = 19;
    const TopMargin = 60;
    const BottomMargin = 60;
    const Distance = 32;
    const amplitude = 7; // 흔들림 진폭 (작게)
    const waveSpeed = 0.7; // 웨이브 속도 (느리게)
    const gamma = 1.0; // 곡선 완화
    const copies = Math.floor((g.height - TopMargin - BottomMargin) / Distance);
    g.fill(0);
    g.noStroke();
    g.textFont(st.font || 'IPAMincho Regular');
    g.textSize(FontSize);
    g.textAlign(g.LEFT, g.CENTER);
    for (let idx = 0; idx < copies; idx++) {
      const y = TopMargin + idx * Distance;
      // 중앙정렬
      let totalW = 0;
      for (let i = 0; i < word.length; i++) totalW += g.textWidth(word[i]);
      let tracking = 12;
      totalW += tracking * (word.length - 1);
      let x = g.width / 2 - totalW / 2;
      let xpos = x;
      for (let i = 0; i < word.length; i++) {
        // 각 글자별로 부드러운 웨이브
        let tChar = t * waveSpeed + i * 0.18 + idx * 0.12;
        let ease = Math.pow(Math.abs(Math.sin(tChar)), gamma);
        let yOffset = -ease * amplitude;
        g.text(word[i], xpos, y + yOffset);
        xpos += g.textWidth(word[i]) + tracking;
      }
    }
  }

  function updateAndDrawCommas_p5(p, g, st) {
    g.textSize(44);
    g.fill(0);
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
  }

drawFns['1'] = (p, g, st) => {
  if (!st.inited) {
    st.inited = true;
    st.t = 0;
    st.dots = [];
    st.font = loadedFont;
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
  drawFEBText_p5(g, st, st.t);
  updateAndDrawCommas_p5(p, g, st);
  st.t += 1/30;
};
})();
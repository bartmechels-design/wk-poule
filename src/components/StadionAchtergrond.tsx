"use client";
import { useEffect, useRef } from "react";

export default function StadionAchtergrond() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let animId: number;
    let tick = 0;

    // Pre-computed static elements
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.7 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 2.8 + 0.6,
      big: Math.random() > 0.72,
    }));

    const bokeh = Array.from({ length: 32 }, () => ({
      x: Math.random() * 0.95 + 0.025,
      y: Math.random() * 0.44 + 0.02,
      r: Math.random() * 24 + 5,
      alpha: Math.random() * 0.09 + 0.025,
      hue: Math.random() > 0.55 ? 42 + Math.random() * 16 : 185 + Math.random() * 35,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.45 + 0.1,
    }));

    const crowd = Array.from({ length: 720 }, (_, i) => ({
      xi: (i * 137.508) % 1,
      yi: (i * 97.3) % 1,
      hue: [0, 120, 220, 38, 280, 60, 180][i % 7],
      phase: (i * 53.1) % (Math.PI * 2),
    }));

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      tick += 0.009;

      const hY = H * 0.4;         // horizon Y
      const fNY = H * 1.1;         // field near edge Y (below screen)

      // Far corners of field (at horizon)
      const fFL = { x: W * 0.19, y: hY };
      const fFR = { x: W * 0.81, y: hY };
      // Near corners of field
      const fNL = { x: -W * 0.22, y: fNY };
      const fNR = { x: W * 1.22, y: fNY };

      // Field point: u=0 far, u=1 near; v=0 left, v=1 right
      function fp(u: number, v: number) {
        const y = hY + (fNY - hY) * u;
        const xl = fFL.x + (fNL.x - fFL.x) * u;
        const xr = fFR.x + (fNR.x - fFR.x) * u;
        return { x: xl + (xr - xl) * v, y };
      }

      // ─── 1. SKY ──────────────────────────────────────────────────────────
      const sky = ctx!.createLinearGradient(0, 0, 0, hY + 55);
      sky.addColorStop(0,    "#000408");
      sky.addColorStop(0.28, "#010b15");
      sky.addColorStop(0.58, "#020e0b");
      sky.addColorStop(0.84, "#061916");
      sky.addColorStop(1,    "#0b2319");
      ctx!.fillStyle = sky;
      ctx!.fillRect(0, 0, W, hY + 55);

      // ─── 2. STARS ────────────────────────────────────────────────────────
      ctx!.save();
      ctx!.beginPath();
      ctx!.rect(0, 0, W, hY * 0.9);
      ctx!.clip();
      stars.forEach(s => {
        const t = 0.5 + 0.5 * Math.sin(tick * s.speed + s.phase);
        const alpha = (0.22 + 0.68 * t) * (1 - s.y * 0.45);
        if (s.big) {
          const gr = ctx!.createRadialGradient(s.x * W, s.y * hY, 0, s.x * W, s.y * hY, s.r * 5);
          gr.addColorStop(0, `rgba(210,228,255,${alpha * 0.38})`);
          gr.addColorStop(1, "rgba(0,0,0,0)");
          ctx!.beginPath();
          ctx!.arc(s.x * W, s.y * hY, s.r * 5, 0, Math.PI * 2);
          ctx!.fillStyle = gr;
          ctx!.fill();
        }
        ctx!.beginPath();
        ctx!.arc(s.x * W, s.y * hY, s.r * (0.55 + 0.45 * t), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(228,240,255,${alpha})`;
        ctx!.fill();
      });
      ctx!.restore();

      // ─── 3. BACK STAND (behind far end) ──────────────────────────────────
      const backGr = ctx!.createLinearGradient(0, 0, 0, hY + 6);
      backGr.addColorStop(0,    "#01080f");
      backGr.addColorStop(0.55, "#040d18");
      backGr.addColorStop(0.9,  "#07181a");
      backGr.addColorStop(1,    "#0a2218");
      ctx!.fillStyle = backGr;
      ctx!.fillRect(0, 0, W, hY + 6);

      // Seating tiers in back stand
      const rowCount = 18;
      const standTop = hY * 0.07;
      const standH = hY * 0.8;
      for (let row = 0; row < rowCount; row++) {
        const rowY = standTop + (row / rowCount) * standH;
        const rowH = standH / rowCount;
        const depth = 1 - row / rowCount;
        const seatsW = Math.floor(W / 4);
        for (let s = 0; s < seatsW; s++) {
          const hue = [0, 120, 30, 215, 60, 270][s % 6];
          const wave = Math.max(0, Math.sin(tick * 2.8 + s * 0.09 + row * 0.35));
          const a = (0.038 + 0.075 * wave) * depth;
          ctx!.fillStyle = `hsla(${hue},72%,55%,${a})`;
          ctx!.fillRect(s * 4 + (row & 1) * 2, rowY, 3, rowH * 0.72);
        }
        // Row separator
        ctx!.fillStyle = `rgba(0,0,0,${0.28 * depth})`;
        ctx!.fillRect(0, rowY + rowH * 0.72, W, rowH * 0.28);
      }

      // Roof silhouette & pillars
      ctx!.fillStyle = "rgba(0,4,10,0.92)";
      ctx!.fillRect(0, 0, W, standTop * 0.65);
      for (let p = 0; p < 14; p++) {
        ctx!.fillStyle = "rgba(0,6,16,0.65)";
        ctx!.fillRect((p / 14) * W + W / 28 - 2, 0, 4, standTop * 1.4);
      }

      // ─── 4. SIDE STANDS ──────────────────────────────────────────────────
      // Left
      ctx!.save();
      ctx!.beginPath();
      ctx!.moveTo(0, H * 1.02);
      ctx!.lineTo(fFL.x, hY);
      ctx!.lineTo(0, hY);
      ctx!.closePath();
      const lsg = ctx!.createLinearGradient(fFL.x, hY, 0, H * 0.75);
      lsg.addColorStop(0, "#03101e");
      lsg.addColorStop(1, "#07181a");
      ctx!.fillStyle = lsg;
      ctx!.fill();
      for (let r = 0; r < 9; r++) {
        const t = r / 9;
        const ry = hY + (H - hY) * t;
        const rx = fFL.x * (1 - t * 0.06) * 0.88;
        ctx!.strokeStyle = `rgba(255,255,255,${0.022 - t * 0.018})`;
        ctx!.lineWidth = 0.7;
        ctx!.beginPath();
        ctx!.moveTo(0, ry);
        ctx!.lineTo(rx, ry);
        ctx!.stroke();
      }
      ctx!.restore();

      // Right
      ctx!.save();
      ctx!.beginPath();
      ctx!.moveTo(W, H * 1.02);
      ctx!.lineTo(fFR.x, hY);
      ctx!.lineTo(W, hY);
      ctx!.closePath();
      const rsg = ctx!.createLinearGradient(fFR.x, hY, W, H * 0.75);
      rsg.addColorStop(0, "#03101e");
      rsg.addColorStop(1, "#07181a");
      ctx!.fillStyle = rsg;
      ctx!.fill();
      for (let r = 0; r < 9; r++) {
        const t = r / 9;
        const ry = hY + (H - hY) * t;
        const rx = W - (W - fFR.x) * (1 - t * 0.06) * 0.88;
        ctx!.strokeStyle = `rgba(255,255,255,${0.022 - t * 0.018})`;
        ctx!.lineWidth = 0.7;
        ctx!.beginPath();
        ctx!.moveTo(rx, ry);
        ctx!.lineTo(W, ry);
        ctx!.stroke();
      }
      ctx!.restore();

      // ─── 5. GRASS WITH PERSPECTIVE LIGHTING ──────────────────────────────
      const numStripes = 20;
      for (let i = 0; i < numStripes; i++) {
        const u0 = i / numStripes;
        const u1 = (i + 1) / numStripes;
        const p0l = fp(u0, 0), p0r = fp(u0, 1);
        const p1l = fp(u1, 0), p1r = fp(u1, 1);

        // Depth-based brightness (brighter near camera, under floodlights)
        const lightFactor = 0.38 + 0.92 * u0;
        const even = i % 2 === 0;
        const br = even ? 128 : 92;
        const bg = even ? 198 : 148;
        const bb = even ? 44 : 30;

        const sg = ctx!.createLinearGradient(0, p0l.y, 0, p1l.y);
        sg.addColorStop(0, `rgb(${Math.round(br * lightFactor)},${Math.round(bg * lightFactor)},${Math.round(bb * lightFactor)})`);
        sg.addColorStop(1, `rgb(${Math.round((br + 8) * lightFactor)},${Math.round((bg + 12) * lightFactor)},${Math.round((bb + 4) * lightFactor)})`);

        ctx!.beginPath();
        ctx!.moveTo(p0l.x, p0l.y);
        ctx!.lineTo(p0r.x, p0r.y);
        ctx!.lineTo(p1r.x, p1r.y);
        ctx!.lineTo(p1l.x, p1l.y);
        ctx!.closePath();
        ctx!.fillStyle = sg;
        ctx!.fill();
      }

      // Radial floodlight glow pooling on the grass surface
      [
        { x: W * 0.04, y: H * 0.07 },
        { x: W * 0.96, y: H * 0.07 },
        { x: W * 0.02, y: H * 0.43 },
        { x: W * 0.98, y: H * 0.43 },
      ].forEach(l => {
        const g = ctx!.createRadialGradient(W / 2, H * 0.72, 0, W / 2, H * 0.72, W * 0.65);
        g.addColorStop(0,   "rgba(205,248,175,0.14)");
        g.addColorStop(0.38,"rgba(185,235,155,0.07)");
        g.addColorStop(0.72,"rgba(160,220,130,0.03)");
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, hY, W, H - hY);
      });

      // ─── 6. FIELD MARKINGS ───────────────────────────────────────────────
      ctx!.save();
      ctx!.strokeStyle = "rgba(255,255,255,0.84)";
      ctx!.lineWidth = 2.2;
      ctx!.shadowColor = "rgba(255,255,255,0.5)";
      ctx!.shadowBlur = 5;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";

      // Sidelines
      const p_fl = fp(0, 0), p_fr = fp(0, 1);
      const p_nl = fp(1, 0), p_nr = fp(1, 1);
      ctx!.beginPath(); ctx!.moveTo(p_fl.x, p_fl.y); ctx!.lineTo(p_nl.x, p_nl.y); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(p_fr.x, p_fr.y); ctx!.lineTo(p_nr.x, p_nr.y); ctx!.stroke();
      // Far touchline
      ctx!.beginPath(); ctx!.moveTo(p_fl.x, p_fl.y); ctx!.lineTo(p_fr.x, p_fr.y); ctx!.stroke();
      // Halfway line
      const hl = fp(0.5, 0), hr = fp(0.5, 1);
      ctx!.beginPath(); ctx!.moveTo(hl.x, hl.y); ctx!.lineTo(hr.x, hr.y); ctx!.stroke();

      // Center spot
      const mc = fp(0.5, 0.5);
      ctx!.beginPath(); ctx!.arc(mc.x, mc.y, 4, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(255,255,255,0.85)"; ctx!.fill();

      // Center circle
      const cB = fp(0.66, 0.5), cR = fp(0.5, 0.66);
      ctx!.beginPath();
      ctx!.ellipse(mc.x, mc.y, Math.abs(cR.x - mc.x), Math.abs(cB.y - mc.y), 0, 0, Math.PI * 2);
      ctx!.stroke();

      // Far penalty area
      { const a=fp(0.03,0.29),b=fp(0.03,0.71),c=fp(0.2,0.71),d=fp(0.2,0.29);
        ctx!.beginPath(); ctx!.moveTo(a.x,a.y); ctx!.lineTo(b.x,b.y); ctx!.lineTo(c.x,c.y); ctx!.lineTo(d.x,d.y); ctx!.closePath(); ctx!.stroke(); }
      // Far goal area
      { const a=fp(0,0.42),b=fp(0,0.58),c=fp(0.08,0.58),d=fp(0.08,0.42);
        ctx!.beginPath(); ctx!.moveTo(a.x,a.y); ctx!.lineTo(b.x,b.y); ctx!.lineTo(c.x,c.y); ctx!.lineTo(d.x,d.y); ctx!.closePath(); ctx!.stroke(); }
      // Near penalty area (partly visible)
      { const a=fp(0.8,0.27),b=fp(0.8,0.73),c=fp(1.02,0.73),d=fp(1.02,0.27);
        ctx!.beginPath(); ctx!.moveTo(a.x,a.y); ctx!.lineTo(b.x,b.y); ctx!.lineTo(c.x,c.y); ctx!.lineTo(d.x,d.y); ctx!.closePath(); ctx!.stroke(); }
      ctx!.restore();

      // ─── 7. FAR GOAL ─────────────────────────────────────────────────────
      ctx!.save();
      ctx!.strokeStyle = "rgba(255,255,255,0.9)";
      ctx!.lineWidth = 2.8;
      ctx!.shadowColor = "rgba(255,255,255,0.55)";
      ctx!.shadowBlur = 6;
      const gL = fp(0, 0.43), gR = fp(0, 0.57);
      const gh = 22;
      ctx!.beginPath();
      ctx!.moveTo(gL.x, gL.y);
      ctx!.lineTo(gL.x, gL.y - gh);
      ctx!.lineTo(gR.x, gR.y - gh);
      ctx!.lineTo(gR.x, gR.y);
      ctx!.stroke();
      ctx!.restore();

      // ─── 8. MASTS ────────────────────────────────────────────────────────
      const lightPos = [
        { x: W * 0.04, y: H * 0.07, sz: 1.35 },   // far-left
        { x: W * 0.96, y: H * 0.07, sz: 1.35 },   // far-right
        { x: W * 0.02, y: H * 0.43, sz: 1.0  },   // near-left
        { x: W * 0.98, y: H * 0.43, sz: 1.0  },   // near-right
      ];

      lightPos.forEach((l, i) => {
        const mastBase = i < 2 ? H * 0.44 : H;
        ctx!.save();
        ctx!.strokeStyle = "rgba(72,92,105,0.65)";
        ctx!.lineWidth = i < 2 ? 2.5 : 3.5;
        ctx!.beginPath();
        ctx!.moveTo(l.x, l.y + 5);
        ctx!.lineTo(l.x, mastBase);
        ctx!.stroke();
        // Crossbeam
        ctx!.lineWidth = 1.8;
        ctx!.strokeStyle = "rgba(80,100,115,0.55)";
        const bw = 14 * l.sz;
        ctx!.beginPath();
        ctx!.moveTo(l.x - bw, l.y); ctx!.lineTo(l.x + bw, l.y); ctx!.stroke();
        // Light cluster dots
        for (let b = -1; b <= 1; b++) {
          ctx!.beginPath();
          ctx!.arc(l.x + b * 5 * l.sz, l.y, 2.5 * l.sz, 0, Math.PI * 2);
          ctx!.fillStyle = "rgba(210,220,165,0.7)";
          ctx!.fill();
        }
        ctx!.restore();
      });

      // ─── 9. FLOODLIGHTS ──────────────────────────────────────────────────
      lightPos.forEach((l, idx) => {
        const pulse = 0.87 + 0.13 * Math.sin(tick * 0.55 + idx * 1.8);
        const sz = l.sz;

        // Light cone to field
        const coneGr = ctx!.createRadialGradient(l.x, l.y, 0, l.x, l.y, H * 0.95);
        coneGr.addColorStop(0,    `rgba(255,248,210,${0.28 * pulse})`);
        coneGr.addColorStop(0.06, `rgba(252,242,185,${0.18 * pulse})`);
        coneGr.addColorStop(0.22, `rgba(225,240,172,${0.08 * pulse})`);
        coneGr.addColorStop(0.5,  `rgba(185,225,135,${0.035 * pulse})`);
        coneGr.addColorStop(1,    "rgba(0,80,10,0)");
        ctx!.save();
        ctx!.beginPath();
        ctx!.moveTo(l.x, l.y);
        ctx!.lineTo(W / 2 - W * 0.62, H * 1.12);
        ctx!.lineTo(W / 2 + W * 0.62, H * 1.12);
        ctx!.closePath();
        ctx!.fillStyle = coneGr;
        ctx!.fill();
        ctx!.restore();

        // Outer halo (large soft glow)
        const haloR = 135 * sz * pulse;
        const halo = ctx!.createRadialGradient(l.x, l.y, haloR * 0.08, l.x, l.y, haloR);
        halo.addColorStop(0,    `rgba(255,248,195,${0.72 * pulse})`);
        halo.addColorStop(0.1,  `rgba(255,238,165,${0.5 * pulse})`);
        halo.addColorStop(0.28, `rgba(255,215,110,${0.22 * pulse})`);
        halo.addColorStop(0.55, `rgba(255,185,55,${0.08 * pulse})`);
        halo.addColorStop(0.82, `rgba(240,140,20,${0.025 * pulse})`);
        halo.addColorStop(1,    "rgba(200,100,0,0)");
        ctx!.beginPath();
        ctx!.arc(l.x, l.y, haloR, 0, Math.PI * 2);
        ctx!.fillStyle = halo;
        ctx!.fill();

        // Lens flare rings
        [
          { r: 48 * sz, a: 0.72, w: 2.8 },
          { r: 88 * sz, a: 0.42, w: 1.6 },
          { r: 138 * sz, a: 0.24, w: 1.1 },
          { r: 200 * sz, a: 0.13, w: 0.7 },
          { r: 278 * sz, a: 0.06, w: 0.5 },
        ].forEach(ring => {
          ctx!.beginPath();
          ctx!.arc(l.x, l.y, ring.r * pulse, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(255,244,178,${ring.a * pulse})`;
          ctx!.lineWidth = ring.w;
          ctx!.stroke();
        });

        // Starburst rays
        ctx!.save();
        for (let ray = 0; ray < 8; ray++) {
          const angle = (ray / 8) * Math.PI + tick * 0.045 * (idx % 2 === 0 ? 1 : -1);
          const len = (42 + 18 * pulse) * sz;
          const rayGr = ctx!.createLinearGradient(
            l.x, l.y,
            l.x + Math.cos(angle) * len, l.y + Math.sin(angle) * len
          );
          rayGr.addColorStop(0, `rgba(255,252,225,${0.62 * pulse})`);
          rayGr.addColorStop(0.5, `rgba(255,245,195,${0.28 * pulse})`);
          rayGr.addColorStop(1, "rgba(255,240,180,0)");
          ctx!.beginPath();
          ctx!.moveTo(l.x, l.y);
          ctx!.lineTo(l.x + Math.cos(angle) * len, l.y + Math.sin(angle) * len);
          ctx!.strokeStyle = rayGr;
          ctx!.lineWidth = 1.3;
          ctx!.stroke();
        }
        ctx!.restore();

        // Core glow
        const coreR = 7.5 * sz;
        const core = ctx!.createRadialGradient(l.x, l.y, 0, l.x, l.y, coreR);
        core.addColorStop(0,   "rgba(255,255,255,1)");
        core.addColorStop(0.22,"rgba(255,255,235,0.95)");
        core.addColorStop(0.55,"rgba(255,248,210,0.55)");
        core.addColorStop(1,   "rgba(255,235,170,0)");
        ctx!.beginPath();
        ctx!.arc(l.x, l.y, coreR, 0, Math.PI * 2);
        ctx!.fillStyle = core;
        ctx!.fill();

        // Bright specular dot
        ctx!.beginPath();
        ctx!.arc(l.x, l.y, 2.8 * sz, 0, Math.PI * 2);
        ctx!.fillStyle = "white";
        ctx!.fill();
      });

      // ─── 10. HORIZON ATMOSPHERIC GLOW ────────────────────────────────────
      const hazeGr = ctx!.createLinearGradient(0, hY - 65, 0, hY + 90);
      hazeGr.addColorStop(0,    "rgba(0,0,0,0)");
      hazeGr.addColorStop(0.3,  "rgba(14,55,26,0.18)");
      hazeGr.addColorStop(0.52, "rgba(22,72,32,0.24)");
      hazeGr.addColorStop(0.72, "rgba(10,45,22,0.1)");
      hazeGr.addColorStop(1,    "rgba(0,0,0,0)");
      ctx!.fillStyle = hazeGr;
      ctx!.fillRect(0, hY - 65, W, 155);

      // ─── 11. BOKEH CIRCLES (defocused camera look) ───────────────────────
      ctx!.save();
      bokeh.forEach(b => {
        const pulse = 0.5 + 0.5 * Math.sin(tick * b.speed + b.phase);
        const a = b.alpha * (0.55 + 0.45 * pulse);
        const bgr = ctx!.createRadialGradient(b.x * W, b.y * H, b.r * 0.25, b.x * W, b.y * H, b.r);
        bgr.addColorStop(0,   `hsla(${b.hue},80%,72%,${a * 0.38})`);
        bgr.addColorStop(0.6, `hsla(${b.hue},70%,60%,${a * 0.25})`);
        bgr.addColorStop(1,   `hsla(${b.hue},60%,50%,0)`);
        ctx!.beginPath();
        ctx!.arc(b.x * W, b.y * H, b.r, 0, Math.PI * 2);
        ctx!.fillStyle = bgr;
        ctx!.fill();
        // Characteristic bokeh edge ring
        ctx!.beginPath();
        ctx!.arc(b.x * W, b.y * H, b.r * 0.87, 0, Math.PI * 2);
        ctx!.strokeStyle = `hsla(${b.hue},82%,76%,${a * 0.48})`;
        ctx!.lineWidth = 0.75;
        ctx!.stroke();
      });
      ctx!.restore();

      // ─── 12. CROWD WAVE ──────────────────────────────────────────────────
      ctx!.save();
      crowd.forEach(p => {
        const row = Math.floor(p.yi * rowCount);
        const rowY = standTop + (row / rowCount) * standH + standH / rowCount * 0.28;
        const cx = p.xi * W;
        const wave = Math.max(0, Math.sin(tick * 3.2 + p.xi * 8.5 + row * 0.55));
        const standUp = wave > 0.58;
        const a = standUp ? 0.26 : 0.09;
        ctx!.beginPath();
        if (standUp) {
          ctx!.ellipse(cx, rowY - wave * 3.5, 1.1, 2.5, 0, 0, Math.PI * 2);
        } else {
          ctx!.arc(cx, rowY, 1.4, 0, Math.PI * 2);
        }
        ctx!.fillStyle = `hsla(${p.hue},78%,58%,${a})`;
        ctx!.fill();
      });
      ctx!.restore();

      // ─── 13. VIGNETTE (cinematic) ────────────────────────────────────────
      const vig = ctx!.createRadialGradient(W/2, H*0.48, H*0.12, W/2, H*0.48, H*0.92);
      vig.addColorStop(0,   "rgba(0,0,0,0)");
      vig.addColorStop(0.45,"rgba(0,0,0,0.04)");
      vig.addColorStop(0.72,"rgba(0,0,0,0.22)");
      vig.addColorStop(1,   "rgba(0,0,0,0.68)");
      ctx!.fillStyle = vig;
      ctx!.fillRect(0, 0, W, H);

      // ─── 14. UI READABILITY ──────────────────────────────────────────────
      const uiOv = ctx!.createLinearGradient(0, 0, 0, H);
      uiOv.addColorStop(0,   "rgba(0,0,0,0.34)");
      uiOv.addColorStop(0.28,"rgba(0,0,0,0.04)");
      uiOv.addColorStop(0.7, "rgba(0,0,0,0.06)");
      uiOv.addColorStop(1,   "rgba(0,0,0,0.44)");
      ctx!.fillStyle = uiOv;
      ctx!.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: -1,
        display: "block",
      }}
    />
  );
}

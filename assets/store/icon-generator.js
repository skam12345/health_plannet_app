const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

// 토성 + 팔근육. 512 기준 좌표, 중심 (256,256)
const arm = `M -10 52 C 4 50, 18 36, 34 34 C 48 32, 56 40, 58 48 C 60 42, 59 34, 56 28
 C 52 24, 51 16, 56 11 C 62 6, 72 7, 76 13 C 79 18, 78 25, 73 29 C 77 40, 81 56, 78 67
 C 76 76, 67 81, 56 80 C 36 80, 14 80, -10 82 Z`;

function saturn(bgColor) {
  return `
  <defs>
    <radialGradient id="pl" cx="40%" cy="35%" r="75%">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DADAE0"/>
    </radialGradient>
    <clipPath id="planet"><circle cx="256" cy="256" r="150"/></clipPath>
    <clipPath id="front"><rect x="-400" y="0" width="800" height="400"/></clipPath>
  </defs>
  <g transform="translate(256 256) rotate(-18)">
    <ellipse rx="236" ry="62" fill="none" stroke="#FFFFFF" stroke-width="20"/>
  </g>
  <circle cx="256" cy="256" r="150" fill="url(#pl)"/>
  <g transform="translate(256 256) rotate(-18)" clip-path="url(#front)">
    <ellipse rx="236" ry="62" fill="none" stroke="${bgColor}" stroke-width="40"/>
    <ellipse rx="236" ry="62" fill="none" stroke="#FFFFFF" stroke-width="20"/>
  </g>
  <g clip-path="url(#planet)"><g transform="translate(256 252) scale(3.0) translate(-40 -46)">
    <path d="${arm}" fill="#0A0A0C"/>
  </g></g>`;
}

const full = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#22222A"/><stop offset="1" stop-color="#050507"/></radialGradient></defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(0.9) translate(-256 -256)">${saturn('#0E0E12')}</g></svg>`;

const round = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#22222A"/><stop offset="1" stop-color="#050507"/></radialGradient></defs>
  <circle cx="256" cy="256" r="256" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(0.78) translate(-256 -256)">${saturn('#0E0E12')}</g></svg>`;

// adaptive foreground: 108dp 캔버스, 안전영역 66dp
const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <g transform="translate(256 256) scale(0.6) translate(-256 -256)">${saturn('#0E0E12')}</g></svg>`;

const render = (svg, size, out) => {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, png);
};

const res = process.argv[2];
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, m] of Object.entries(dens)) {
  render(full(), 48 * m, `${res}/mipmap-${d}/ic_launcher.png`);
  render(round, 48 * m, `${res}/mipmap-${d}/ic_launcher_round.png`);
  render(fg, 108 * m, `${res}/mipmap-${d}/ic_launcher_foreground.png`);
}
render(full(), 512, process.argv[3] + '/icon-512.png');
render(full(), 1024, process.argv[3] + '/icon-preview-1024.png');
console.log('ok');

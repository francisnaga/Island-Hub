const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08090C"/>
      <stop offset="50%" stop-color="#0D1117"/>
      <stop offset="100%" stop-color="#0A191C"/>
    </linearGradient>
    <radialGradient id="tealGlow" cx="20%" cy="20%" r="45%">
      <stop offset="0%" stop-color="#14B8A6" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#14B8A6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="goldGlow" cx="85%" cy="30%" r="40%">
      <stop offset="0%" stop-color="#E8B84A" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#E8B84A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="centerGlow" cx="50%" cy="70%" r="50%">
      <stop offset="0%" stop-color="#0F6E6E" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0F6E6E" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6"/>
      <stop offset="100%" stop-color="#0A4F4F"/>
    </linearGradient>
    <linearGradient id="goldWave" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E8B84A"/>
      <stop offset="50%" stop-color="#F3D078"/>
      <stop offset="100%" stop-color="#E8B84A"/>
    </linearGradient>
    <filter id="cardGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#tealGlow)"/>
  <rect width="1200" height="630" fill="url(#goldGlow)"/>
  <rect width="1200" height="630" fill="url(#centerGlow)"/>

  <!-- Subtle Precision Grid Pattern -->
  <g opacity="0.04" stroke="#FFFFFF" stroke-width="1">
    <path d="M0 80 H1200 M0 160 H1200 M0 240 H1200 M0 320 H1200 M0 400 H1200 M0 480 H1200 M0 560 H1200"/>
    <path d="M120 0 V630 M240 0 V630 M360 0 V630 M480 0 V630 M600 0 V630 M720 0 V630 M840 0 V630 M960 0 V630 M1080 0 V630"/>
  </g>

  <!-- Top Tagline Pill -->
  <g transform="translate(80, 72)">
    <rect width="420" height="36" rx="18" fill="#14B8A6" fill-opacity="0.12" stroke="#14B8A6" stroke-opacity="0.35" stroke-width="1"/>
    <circle cx="18" cy="18" r="4" fill="#2DD4BF"/>
    <text x="32" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#2DD4BF" letter-spacing="1.5">NIGERIA MARITIME UNIVERSITY · NMU</text>
  </g>

  <!-- Brand Lockup -->
  <g transform="translate(80, 138)">
    <!-- Brand Icon -->
    <rect width="76" height="76" rx="22" fill="url(#logoGrad)" filter="url(#cardGlow)"/>
    <!-- Stylized anchor / J in logo -->
    <path d="M22 28 H54" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <path d="M38 28 V50 C38 56 34 58 26 56" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M20 44 Q29 48 38 44 T56 44" stroke="#E8B84A" stroke-width="3.5" stroke-linecap="round" fill="none"/>

    <!-- Brand Wordmark -->
    <text x=\"96\" y=\"56\" font-family=\"system-ui, -apple-system, sans-serif\" font-size=\"58\" font-weight=\"800\" fill=\"#FFFFFF\" letter-spacing=\"-1.5\">jetty</text>
  </g>

  <!-- Headline -->
  <g transform="translate(80, 268)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="800" fill="#FFFFFF" letter-spacing="-1.2">The Sovereign Campus Marketplace</text>
    <text x="0" y="46" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#94A3B8" letter-spacing="-0.2">Cadet gear &amp; action rigs · Student lodges · Campus services · Daily essentials</text>
    <text x="0" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#E8B84A">Direct WhatsApp Ordering · Verified Vendors · Okerenkoko &amp; Kurutie</text>
  </g>

  <!-- Feature Cards Row -->
  <g transform="translate(80, 410)">
    <!-- Card 1 -->
    <g transform="translate(0, 0)">
      <rect width="240" height="82" rx="18" fill="#12161E" stroke="#1F2937" stroke-width="1"/>
      <rect x="16" y="16" width="36" height="36" rx="10" fill="#14B8A6" fill-opacity="0.15"/>
      <text x="34" y="39" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">⚓</text>
      <text x="64" y="33" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">Cadet Gear</text>
      <text x="64" y="50" font-family="system-ui, sans-serif" font-size="12" font-weight="400" fill="#94A3B8">Action rigs &amp; boots</text>
    </g>

    <!-- Card 2 -->
    <g transform="translate(260, 0)">
      <rect width="240" height="82" rx="18" fill="#12161E" stroke="#1F2937" stroke-width="1"/>
      <rect x="16" y="16" width="36" height="36" rx="10" fill="#E8B84A" fill-opacity="0.15"/>
      <text x="34" y="39" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">🏠</text>
      <text x="64" y="33" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">Student Lodges</text>
      <text x="64" y="50" font-family="system-ui, sans-serif" font-size="12" font-weight="400" fill="#94A3B8">Rooms &amp; bedspaces</text>
    </g>

    <!-- Card 3 -->
    <g transform="translate(520, 0)">
      <rect width="240" height="82" rx="18" fill="#12161E" stroke="#1F2937" stroke-width="1"/>
      <rect x="16" y="16" width="36" height="36" rx="10" fill="#22D3EE" fill-opacity="0.15"/>
      <text x="34" y="39" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">🛠️</text>
      <text x="64" y="33" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">Campus Services</text>
      <text x="64" y="50" font-family="system-ui, sans-serif" font-size="12" font-weight="400" fill="#94A3B8">Tailoring, repairs &amp; more</text>
    </g>

    <!-- Card 4 -->
    <g transform="translate(780, 0)">
      <rect width="260" height="82" rx="18" fill="#12161E" stroke="#1F2937" stroke-width="1"/>
      <rect x="16" y="16" width="36" height="36" rx="10" fill="#10B981" fill-opacity="0.15"/>
      <text x="34" y="39" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">💬</text>
      <text x="64" y="33" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">WhatsApp First</text>
      <text x="64" y="50" font-family="system-ui, sans-serif" font-size="12" font-weight="400" fill="#94A3B8">Order directly with seller</text>
    </g>
  </g>

  <!-- Signature Jetty Waterline Waves along Bottom -->
  <g transform="translate(0, 560)">
    <path d="M0 30 Q75 10 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30 V70 H0 Z" fill="#0A4F4F" fill-opacity="0.55"/>
    <path d="M0 30 Q75 10 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30" fill="none" stroke="url(#goldWave)" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Domain Badge -->
    <text x="1120" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="end">jetty.francisnaga.site</text>
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png({ quality: 95 })
  .toFile(path.join(__dirname, '../public/og-image.png'))
  .then((info) => {
    console.log('Successfully generated public/og-image.png:', info);
  })
  .catch((err) => {
    console.error('Error generating og-image.png:', err);
    process.exit(1);
  });

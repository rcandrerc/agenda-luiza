// Menina arrumando a mochila, com cama, lancheira e estrelas ao redor.
export default function Ilustracao() {
  return (
    <svg className="ilustracao" viewBox="0 0 360 250" role="img" aria-label="Menina arrumando a mochila e a lancheira">
      <defs>
        <radialGradient id="pele" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#ffe9d6" /><stop offset="1" stopColor="#f2bd98" /></radialGradient>
        <linearGradient id="cabelo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a5a64" /><stop offset="1" stopColor="#1d1d24" /></linearGradient>
        <linearGradient id="vestido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb9cc" /><stop offset="1" stopColor="#f2849f" /></linearGradient>
        <radialGradient id="iris" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#9a6038" /><stop offset="1" stopColor="#35190a" /></radialGradient>
        <radialGradient id="manga" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#f5c6d4" /></radialGradient>
        <radialGradient id="bochecha"><stop offset="0" stopColor="#ff8fae" stopOpacity=".7" /><stop offset="1" stopColor="#ff8fae" stopOpacity="0" /></radialGradient>
      </defs>
      {/* nuvens e sol */}
      <circle cx="300" cy="52" r="26" fill="#ffd166" />
      <g fill="#fff" opacity=".85">
        <ellipse cx="62" cy="48" rx="30" ry="12" /><ellipse cx="82" cy="40" rx="20" ry="12" />
        <ellipse cx="235" cy="30" rx="24" ry="9" /><ellipse cx="250" cy="24" rx="15" ry="9" />
      </g>
      {/* chão */}
      <ellipse cx="180" cy="232" rx="165" ry="14" fill="#000" opacity=".12" />
      {/* cama */}
      <g>
        <rect x="14" y="150" width="104" height="66" rx="10" fill="#8b5e3c" />
        <rect x="20" y="162" width="92" height="40" rx="8" fill="#7a5cc7" />
        <rect x="20" y="162" width="92" height="14" rx="7" fill="#9a80e0" />
        <rect x="24" y="148" width="34" height="18" rx="9" fill="#fff" />
        <rect x="14" y="206" width="8" height="18" rx="3" fill="#6b4a2f" /><rect x="110" y="206" width="8" height="18" rx="3" fill="#6b4a2f" />
      </g>
      {/* mochila (atrás dela) */}
      <g>
        <rect x="190" y="118" width="58" height="82" rx="18" fill="#f09a3a" />
        <rect x="198" y="150" width="42" height="30" rx="9" fill="#e07d1c" />
        <rect x="205" y="160" width="28" height="5" rx="2.5" fill="#fff" opacity=".8" />
        <path d="M200 120 q19 -22 38 0" fill="none" stroke="#c46a12" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* menina */}
      <g>
        {/* coques de trás */}
        <circle cx="124" cy="58" r="21" fill="url(#cabelo)" /><circle cx="196" cy="58" r="21" fill="url(#cabelo)" />
        <path d="M112 52 q10 -10 22 -2 M184 50 q12 -8 22 2" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".25" />
        <rect x="104" y="68" width="36" height="14" rx="7" fill="#ff9fba" transform="rotate(-18 122 75)" />
        <rect x="180" y="68" width="36" height="14" rx="7" fill="#ff9fba" transform="rotate(18 198 75)" />
        <path d="M112 74 l20 -4 M188 70 l20 4" stroke="#ffc9d9" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        {/* pernas e sapatos */}
        <rect x="141" y="198" width="13" height="26" rx="6.5" fill="url(#pele)" />
        <rect x="166" y="198" width="13" height="26" rx="6.5" fill="url(#pele)" />
        <path d="M134 232 q0 -12 14 -12 h8 q4 0 4 6 v6z" fill="#7a5cc7" />
        <path d="M186 232 q0 -12 -14 -12 h-8 q-4 0 -4 6 v6z" fill="#7a5cc7" />
        <rect x="136" y="226" width="22" height="4" rx="2" fill="#fff" opacity=".8" />
        <rect x="162" y="226" width="22" height="4" rx="2" fill="#fff" opacity=".8" />
        {/* blusa e saia */}
        <path d="M128 206 q32 14 64 0 l-6 -66 q-26 12 -52 0z" fill="url(#vestido)" />
        <path d="M134 198 q26 9 52 0" fill="none" stroke="#fff" strokeWidth="3" opacity=".45" strokeLinecap="round" />
        {/* braços (pele) e mangas bufantes */}
        <path d="M134 154 q-16 16 -10 34" fill="none" stroke="url(#pele)" strokeWidth="13" strokeLinecap="round" />
        <path d="M186 154 q26 -2 38 -22" fill="none" stroke="url(#pele)" strokeWidth="13" strokeLinecap="round" />
        <circle cx="124" cy="190" r="8" fill="url(#pele)" /><circle cx="225" cy="129" r="8" fill="url(#pele)" />
        <circle cx="134" cy="151" r="12" fill="url(#manga)" /><circle cx="186" cy="151" r="12" fill="url(#manga)" />
        {/* pescoço e gola */}
        <rect x="150" y="124" width="20" height="20" rx="8" fill="#eaa97d" />
        <path d="M146 140 q14 14 28 0" fill="none" stroke="#f06d93" strokeWidth="4" strokeLinecap="round" />
        {/* orelhas e rosto */}
        <circle cx="120" cy="104" r="8" fill="url(#pele)" /><circle cx="200" cy="104" r="8" fill="url(#pele)" />
        <ellipse cx="160" cy="100" rx="41" ry="38" fill="url(#pele)" />
        {/* cabelo: topo com risca no meio e mechas laterais */}
        <path d="M118 100 q-8 -52 42 -54 q50 2 42 54 q-3 -22 -14 -34 q-14 10 -28 12 q-14 -2 -28 -12 q-11 12 -14 34z" fill="url(#cabelo)" />
        <path d="M160 48 v14" stroke="#15151b" strokeWidth="2" opacity=".5" />
        <path d="M120 98 q-4 22 4 38 q-9 -4 -11 -16 q-2 -14 7 -22z" fill="url(#cabelo)" />
        <path d="M200 98 q4 22 -4 38 q9 -4 11 -16 q2 -14 -7 -22z" fill="url(#cabelo)" />
        <path d="M206 124 q10 18 -2 32" fill="none" stroke="#2a2a33" strokeWidth="4" strokeLinecap="round" />
        <path d="M132 62 q12 -10 28 -9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".3" />
        {/* sobrancelhas */}
        <path d="M136 88 q9 -6 19 -2" fill="none" stroke="#3b2418" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M165 86 q10 -4 19 2" fill="none" stroke="#3b2418" strokeWidth="3.5" strokeLinecap="round" />
        {/* olhos grandes e brilhantes */}
        <ellipse cx="146" cy="103" rx="11" ry="12.5" fill="#fff" />
        <ellipse cx="174" cy="103" rx="11" ry="12.5" fill="#fff" />
        <circle cx="147" cy="104" r="10" fill="url(#iris)" /><circle cx="173" cy="104" r="10" fill="url(#iris)" />
        <circle cx="147" cy="104" r="5.5" fill="#150b05" /><circle cx="173" cy="104" r="5.5" fill="#150b05" />
        <circle cx="151" cy="99.5" r="3.6" fill="#fff" /><circle cx="177" cy="99.5" r="3.6" fill="#fff" />
        <circle cx="143.5" cy="108.5" r="1.8" fill="#fff" /><circle cx="169.5" cy="108.5" r="1.8" fill="#fff" />
        <path d="M135 97 q11 -9 22 -1" fill="none" stroke="#24150c" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M163 96 q11 -8 22 1" fill="none" stroke="#24150c" strokeWidth="2.2" strokeLinecap="round" />
        {/* nariz, bochechas e sorriso */}
        <ellipse cx="160" cy="116" rx="3.5" ry="2.6" fill="#e59a72" opacity=".8" />
        <circle cx="134" cy="119" r="9" fill="url(#bochecha)" /><circle cx="186" cy="119" r="9" fill="url(#bochecha)" />
        <path d="M149 126 q11 8 22 0" fill="none" stroke="#c2574a" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* lancheira */}
      <g>
        <rect x="108" y="184" width="40" height="30" rx="8" fill="#2e9e6a" />
        <rect x="118" y="178" width="20" height="10" rx="4" fill="none" stroke="#1f7a4f" strokeWidth="4" />
        <rect x="108" y="196" width="40" height="5" fill="#fff" opacity=".7" />
        <circle cx="128" cy="199" r="3.5" fill="#ffd166" />
      </g>
      {/* escova e vassoura-brinquedo */}
      <g>
        <rect x="286" y="132" width="8" height="90" rx="4" fill="#c9a06a" />
        <path d="M268 222 l44 0 l-8 -26 l-28 0 z" fill="#ffb627" />
        <path d="M274 222 v-24 M284 222 v-24 M294 222 v-24 M304 222 v-24" stroke="#e8981a" strokeWidth="2.5" />
      </g>
      {/* checks e estrelas */}
      <g>
        <circle cx="244" cy="96" r="18" fill="#2e9e6a" />
        <path d="M235 96 l7 7 l12 -14" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70 108 l5 11 l12 1 l-9 8 l3 12 l-11 -6 l-11 6 l3 -12 l-9 -8 l12 -1z" fill="#ffd166" />
        <path d="M320 150 l4 8 l9 1 l-7 6 l2 9 l-8 -4 l-8 4 l2 -9 l-7 -6 l9 -1z" fill="#ffd166" />
      </g>
    </svg>
  );
}

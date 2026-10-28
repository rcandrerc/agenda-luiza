// Menina arrumando a mochila, com cama, lancheira e estrelas ao redor.
export default function Ilustracao() {
  return (
    <svg className="ilustracao" viewBox="0 0 360 250" role="img" aria-label="Menina arrumando a mochila e a lancheira">
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
        <rect x="140" y="196" width="14" height="30" rx="6" fill="#f3c9a5" />
        <rect x="164" y="196" width="14" height="30" rx="6" fill="#f3c9a5" />
        <ellipse cx="147" cy="228" rx="13" ry="6" fill="#2f8fb8" /><ellipse cx="171" cy="228" rx="13" ry="6" fill="#2f8fb8" />
        <path d="M130 200 q29 14 58 0 l-8 -62 h-42 z" fill="#ff7aa8" />
        <path d="M150 138 q10 10 20 0" fill="#fff" opacity=".6" />
        {/* braços */}
        <path d="M134 150 q-22 18 -14 42" fill="none" stroke="#f3c9a5" strokeWidth="12" strokeLinecap="round" />
        <path d="M186 150 q26 -4 40 -22" fill="none" stroke="#f3c9a5" strokeWidth="12" strokeLinecap="round" />
        {/* cabeça */}
        <circle cx="160" cy="100" r="34" fill="#f3c9a5" />
        <path d="M126 98 q4 -40 36 -38 q34 -2 36 38 q-10 -22 -36 -20 q-26 -2 -36 20z" fill="#5a3a22" />
        <circle cx="124" cy="112" r="13" fill="#5a3a22" /><circle cx="196" cy="112" r="13" fill="#5a3a22" />
        <circle cx="124" cy="112" r="5" fill="#ffd166" /><circle cx="196" cy="112" r="5" fill="#ffd166" />
        <circle cx="148" cy="102" r="4" fill="#2b1d12" /><circle cx="172" cy="102" r="4" fill="#2b1d12" />
        <circle cx="140" cy="114" r="6" fill="#ff9bb5" opacity=".6" /><circle cx="180" cy="114" r="6" fill="#ff9bb5" opacity=".6" />
        <path d="M150 118 q10 10 20 0" fill="none" stroke="#a5412f" strokeWidth="3.5" strokeLinecap="round" />
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

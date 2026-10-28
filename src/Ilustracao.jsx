// Menina arrumando a mochila, com cama, lancheira e estrelas ao redor.
export default function Ilustracao() {
  return (
    <svg className="ilustracao" viewBox="0 0 360 250" role="img" aria-label="Menina arrumando a mochila e a lancheira">
      <defs>
        <radialGradient id="pele" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#ffe3c8" /><stop offset="1" stopColor="#f0b88c" /></radialGradient>
        <linearGradient id="cabelo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8a5430" /><stop offset="1" stopColor="#3b2214" /></linearGradient>
        <linearGradient id="vestido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9cc2" /><stop offset="1" stopColor="#ee4f8a" /></linearGradient>
        <radialGradient id="iris" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#c58a4e" /><stop offset="1" stopColor="#5b3416" /></radialGradient>
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
        {/* cabelo de trás e maria-chiquinhas */}
        <path d="M118 104 q-4 -52 42 -52 q46 0 42 52 q2 30 -10 44 h-64 q-12 -14 -10 -44z" fill="url(#cabelo)" />
        <g>
          <ellipse cx="116" cy="132" rx="17" ry="24" fill="url(#cabelo)" transform="rotate(14 116 132)" />
          <ellipse cx="204" cy="132" rx="17" ry="24" fill="url(#cabelo)" transform="rotate(-14 204 132)" />
          <path d="M104 104 l12 8 l-2 -14z M216 104 l-12 8 l2 -14z" fill="#ff5c93" />
          <circle cx="110" cy="105" r="9" fill="#ff5c93" /><circle cx="210" cy="105" r="9" fill="#ff5c93" />
          <circle cx="110" cy="105" r="3.5" fill="#ffd0e0" /><circle cx="210" cy="105" r="3.5" fill="#ffd0e0" />
        </g>
        {/* pernas e sapatos */}
        <rect x="141" y="196" width="13" height="28" rx="6.5" fill="url(#pele)" />
        <rect x="166" y="196" width="13" height="28" rx="6.5" fill="url(#pele)" />
        <path d="M134 232 q0 -12 14 -12 h8 q4 0 4 6 v6z" fill="#2f8fb8" />
        <path d="M186 232 q0 -12 -14 -12 h-8 q-4 0 -4 6 v6z" fill="#2f8fb8" />
        <rect x="136" y="226" width="22" height="4" rx="2" fill="#fff" opacity=".8" />
        <rect x="162" y="226" width="22" height="4" rx="2" fill="#fff" opacity=".8" />
        {/* vestido */}
        <path d="M128 204 q32 16 64 0 l-8 -62 q-24 10 -48 0z" fill="url(#vestido)" />
        <path d="M134 196 q26 10 52 0" fill="none" stroke="#fff" strokeWidth="3" opacity=".5" strokeLinecap="round" />
        <path d="M148 142 q12 12 24 0 l-4 -6 q-8 6 -16 0z" fill="#fff" />
        <circle cx="160" cy="160" r="4" fill="#ffd166" /><circle cx="160" cy="176" r="4" fill="#ffd166" />
        {/* braços e mãos */}
        <path d="M137 150 q-20 16 -12 38" fill="none" stroke="#ff6fa3" strokeWidth="15" strokeLinecap="round" />
        <path d="M183 150 q26 -2 40 -20" fill="none" stroke="#ff6fa3" strokeWidth="15" strokeLinecap="round" />
        <circle cx="125" cy="192" r="8" fill="url(#pele)" /><circle cx="224" cy="128" r="8" fill="url(#pele)" />
        {/* pescoço, orelhas e cabeça */}
        <rect x="150" y="124" width="20" height="18" rx="8" fill="#e9a97c" />
        <circle cx="121" cy="104" r="8" fill="url(#pele)" /><circle cx="199" cy="104" r="8" fill="url(#pele)" />
        <ellipse cx="160" cy="100" rx="40" ry="38" fill="url(#pele)" />
        {/* franja */}
        <path d="M120 96 q-2 -42 40 -44 q42 2 40 44 q-8 -20 -26 -26 q-6 14 -24 18 q-18 4 -30 8z" fill="url(#cabelo)" />
        <path d="M134 64 q14 -8 30 -6" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".35" />
        {/* sobrancelhas */}
        <path d="M137 87 q9 -6 18 -1" fill="none" stroke="#4a2a14" strokeWidth="3" strokeLinecap="round" />
        <path d="M165 86 q9 -5 18 1" fill="none" stroke="#4a2a14" strokeWidth="3" strokeLinecap="round" />
        {/* olhos grandes */}
        <ellipse cx="146" cy="102" rx="11.5" ry="13.5" fill="#fff" />
        <ellipse cx="174" cy="102" rx="11.5" ry="13.5" fill="#fff" />
        <circle cx="147" cy="104" r="9" fill="url(#iris)" /><circle cx="173" cy="104" r="9" fill="url(#iris)" />
        <circle cx="147" cy="104" r="4.6" fill="#1d1109" /><circle cx="173" cy="104" r="4.6" fill="#1d1109" />
        <circle cx="150.5" cy="100" r="3.4" fill="#fff" /><circle cx="176.5" cy="100" r="3.4" fill="#fff" />
        <circle cx="144" cy="108" r="1.6" fill="#fff" /><circle cx="170" cy="108" r="1.6" fill="#fff" />
        <path d="M134 98 q12 -10 24 0" fill="none" stroke="#2b1a0e" strokeWidth="2" strokeLinecap="round" />
        <path d="M162 98 q12 -10 24 0" fill="none" stroke="#2b1a0e" strokeWidth="2" strokeLinecap="round" />
        <path d="M134 98 l-4 -3 M186 98 l4 -3" stroke="#2b1a0e" strokeWidth="2.5" strokeLinecap="round" />
        {/* nariz, bochechas e boca */}
        <path d="M158 114 q2 3 4 0" fill="none" stroke="#c98558" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="136" cy="118" r="8" fill="url(#bochecha)" /><circle cx="184" cy="118" r="8" fill="url(#bochecha)" />
        <path d="M146 123 q14 18 28 0 q-14 4 -28 0z" fill="#b03a3a" />
        <path d="M148 124 q12 3 24 0 q-1 4 -12 4 q-10 0 -12 -4z" fill="#fff" />
        <path d="M154 130 q6 5 12 0 q-6 -2 -12 0z" fill="#ff8a8a" />
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

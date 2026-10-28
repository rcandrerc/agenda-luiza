// Menina arrumando a mochila, com cama, lancheira e estrelas ao redor.
export default function Ilustracao() {
  return (
    <svg className="ilustracao" viewBox="0 0 360 250" role="img" aria-label="Menina arrumando a mochila e a lancheira">
      <defs>
        <radialGradient id="pele" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#fbdcc2" /><stop offset="1" stopColor="#eaab85" /></radialGradient>
        <linearGradient id="cabelo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8a5a38" /><stop offset="1" stopColor="#3b2214" /></linearGradient>
        <linearGradient id="vestido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb9cc" /><stop offset="1" stopColor="#f2849f" /></linearGradient>
        <radialGradient id="iris" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#7a4a2a" /><stop offset="1" stopColor="#2a160a" /></radialGradient>
        <radialGradient id="manga" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#f5c6d4" /></radialGradient>
        <linearGradient id="telha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9573a" /><stop offset="1" stopColor="#a63a25" /></linearGradient>
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
        {/* cabelo comprido e ondulado, por trás */}
        <path d="M114 98 q-12 -62 46 -62 q58 0 46 62 q12 26 6 56 q-4 14 -16 8 q4 -14 -2 -24 l-68 0 q-6 10 -2 24 q-12 6 -16 -8 q-6 -30 6 -56z" fill="url(#cabelo)" />
        <path d="M110 120 q-4 18 2 34 M210 120 q4 18 -2 34" fill="none" stroke="#b27a48" strokeWidth="3" strokeLinecap="round" opacity=".6" />
        {/* pernas e sapatos */}
        <rect x="141" y="200" width="13" height="24" rx="6.5" fill="url(#pele)" />
        <rect x="166" y="200" width="13" height="24" rx="6.5" fill="url(#pele)" />
        <path d="M134 232 q0 -12 14 -12 h8 q4 0 4 6 v6z" fill="#f4ede2" />
        <path d="M186 232 q0 -12 -14 -12 h-8 q-4 0 -4 6 v6z" fill="#f4ede2" />
        <rect x="136" y="227" width="22" height="3.5" rx="1.7" fill="#c9482f" />
        <rect x="162" y="227" width="22" height="3.5" rx="1.7" fill="#c9482f" />
        {/* saia e blusa vermelho-telha */}
        <path d="M130 208 q30 12 60 0 l-4 -34 h-52z" fill="#6f8fb5" />
        <path d="M128 176 q32 10 64 0 l-4 -36 q-28 10 -56 0z" fill="url(#telha)" />
        <g>
          <circle cx="152" cy="166" r="3.2" fill="#f7c948" /><circle cx="152" cy="166" r="1.1" fill="#fff" />
          <circle cx="160" cy="161" r="3.2" fill="#f7c948" /><circle cx="160" cy="161" r="1.1" fill="#fff" />
          <circle cx="168" cy="167" r="3" fill="#fff" /><circle cx="168" cy="167" r="1" fill="#f7c948" />
          <path d="M160 165 v10 M152 170 v5 M168 171 v4" stroke="#4f8a4b" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        {/* alça da bolsa */}
        <path d="M186 140 q-6 34 -12 68" fill="none" stroke="#c9b48a" strokeWidth="7" strokeLinecap="round" opacity=".95" />
        {/* braços e mangas bufantes */}
        <path d="M134 154 q-16 16 -10 34" fill="none" stroke="url(#pele)" strokeWidth="13" strokeLinecap="round" />
        <path d="M186 154 q26 -2 38 -22" fill="none" stroke="url(#pele)" strokeWidth="13" strokeLinecap="round" />
        <circle cx="124" cy="190" r="8" fill="url(#pele)" /><circle cx="225" cy="129" r="8" fill="url(#pele)" />
        <circle cx="134" cy="151" r="13" fill="url(#telha)" /><circle cx="186" cy="151" r="13" fill="url(#telha)" />
        {/* pescoço e gargantilha laranja */}
        <rect x="150" y="124" width="20" height="20" rx="8" fill="#e9a97c" />
        <path d="M148 138 q12 8 24 0" fill="none" stroke="#f59b2b" strokeWidth="5" strokeLinecap="round" />
        <path d="M150 139 q10 6 20 0" fill="none" stroke="#ffd08a" strokeWidth="1.5" strokeDasharray="2 3" strokeLinecap="round" />
        {/* orelhas e rosto */}
        <circle cx="120" cy="104" r="7" fill="url(#pele)" /><circle cx="200" cy="104" r="7" fill="url(#pele)" />
        <ellipse cx="160" cy="100" rx="40" ry="38" fill="url(#pele)" />
        {/* cabelo da frente: risca de lado e mechas emoldurando o rosto */}
        <path d="M119 102 q-10 -58 44 -62 q46 2 38 62 q-2 -22 -12 -34 q-26 14 -50 6 q-14 8 -20 28z" fill="url(#cabelo)" />
        <path d="M120 96 q-6 30 4 50 q-12 -8 -14 -26 q0 -18 10 -24z" fill="url(#cabelo)" />
        <path d="M200 96 q6 30 -4 50 q12 -8 14 -26 q0 -18 -10 -24z" fill="url(#cabelo)" />
        <path d="M136 56 q16 -10 34 -6 M126 78 q-2 -8 4 -16" fill="none" stroke="#c18a52" strokeWidth="3.5" strokeLinecap="round" opacity=".7" />
        {/* presilha */}
        <rect x="184" y="44" width="16" height="7" rx="3" fill="#e8d7b6" transform="rotate(20 192 47)" />
        <circle cx="187" cy="50" r="2.2" fill="#f28ab0" /><circle cx="193" cy="47" r="2.2" fill="#6ec1e4" /><circle cx="199" cy="44" r="2.2" fill="#f7c948" />
        {/* sobrancelhas */}
        <path d="M136 88 q9 -5 19 -2" fill="none" stroke="#3b2418" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M165 86 q10 -3 19 2" fill="none" stroke="#3b2418" strokeWidth="3.2" strokeLinecap="round" />
        {/* olhos castanhos */}
        <ellipse cx="147" cy="103" rx="9.5" ry="10" fill="#fff" />
        <ellipse cx="173" cy="103" rx="9.5" ry="10" fill="#fff" />
        <circle cx="147.5" cy="104" r="7.6" fill="url(#iris)" /><circle cx="172.5" cy="104" r="7.6" fill="url(#iris)" />
        <circle cx="147.5" cy="104" r="3.9" fill="#150b05" /><circle cx="172.5" cy="104" r="3.9" fill="#150b05" />
        <circle cx="150.5" cy="100.5" r="2.7" fill="#fff" /><circle cx="175.5" cy="100.5" r="2.7" fill="#fff" />
        <path d="M137 99 q10 -8 20 -1" fill="none" stroke="#24150c" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M163 98 q10 -7 20 1" fill="none" stroke="#24150c" strokeWidth="2.6" strokeLinecap="round" />
        {/* óculos lilás transparentes */}
        <g fill="#fff" fillOpacity=".16" stroke="#b79be8" strokeWidth="2.6" strokeLinejoin="round">
          <path d="M134 94 q0 -6 8 -6 h12 q8 0 8 8 v10 q0 10 -10 10 h-8 q-10 0 -10 -10z" />
          <path d="M162 96 q0 -8 8 -8 h12 q8 0 8 6 v12 q0 10 -10 10 h-8 q-10 0 -10 -10z" />
        </g>
        <path d="M150 100 q10 -5 12 0" fill="none" stroke="#b79be8" strokeWidth="3" strokeLinecap="round" />
        <path d="M134 98 l-12 3 M190 98 l12 3" stroke="#b79be8" strokeWidth="3" strokeLinecap="round" />
        {/* nariz, bochechas e sorriso suave */}
        <ellipse cx="160" cy="116" rx="3.2" ry="2.4" fill="#e59a72" opacity=".75" />
        <circle cx="134" cy="120" r="9" fill="url(#bochecha)" /><circle cx="186" cy="120" r="9" fill="url(#bochecha)" />
        <path d="M150 126 q11 7 21 -1" fill="none" stroke="#d1766c" strokeWidth="3" strokeLinecap="round" />
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

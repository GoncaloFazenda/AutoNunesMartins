<a class="discover" href="/stand-orbit/viaturas">
  <span class="eyebrow">Continue a descobrir</span>
  <strong>Ver todas<br />as viaturas</strong>
  <div class="road" aria-hidden="true">
    <span class="trail"></span>
    <div class="car">
      <svg viewBox="0 0 240 92" fill="none" focusable="false">
        <defs>
          <linearGradient
            id="discover-coachwork"
            x1="120"
            y1="15"
            x2="120"
            y2="74"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#f3f4f4" /><stop offset=".42" stop-color="#b7bec4" /><stop
              offset=".48"
              stop-color="#e4e7e9"
            /><stop offset="1" stop-color="#68747f" />
          </linearGradient>
          <linearGradient
            id="discover-glass"
            x1="102"
            y1="25"
            x2="144"
            y2="49"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#74858e" /><stop offset="1" stop-color="#17232d" />
          </linearGradient>
        </defs>
        <ellipse cx="123" cy="82" rx="100" ry="5" fill="#000" opacity=".2" />
        <g class="body">
          <path
            d="M19 56 27 46 58 40C78 18 105 13 129 20 148 24 158 36 174 42L207 48Q221 51 224 62L225 70 217 75H24L16 68Z"
            fill="url(#discover-coachwork)"
            stroke="#56616b"
            stroke-width="1.2"
          />
          <path
            d="M68 40Q91 20 114 23L126 24 149 41Z"
            fill="url(#discover-glass)"
            stroke="#dce2e6"
            stroke-width="1.5"
          />
          <path d="m118 24 9 17M72 43l-5 22h87l3-21" stroke="#52606b" stroke-width="1" />
          <path d="M30 49q69-9 174 4M83 68h72" stroke="#f5f7f8" stroke-opacity=".8" />
          <path d="M25 72h191" stroke="#27323b" stroke-width="3" />
          <path d="m198 52 19 4-1 5-15-2Z" fill="#eff6f9" /><path
            d="m23 49 13-2-2 6-14 3"
            fill="#9e3437"
          />
          <path
            d="m210 66 13-2M132 47h9"
            stroke="#34424c"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path d="M37 74a19 19 0 0 1 38 0M170 74a19 19 0 0 1 38 0" fill="#192129" />
          <path d="m149 40 8-3 5 3-3 4h-8" fill="#a5afb7" stroke="#53606a" />
        </g>
        {#each [56, 189] as x}
          <g transform={`translate(${x} 72)`}>
            <circle r="15" fill="#172027" stroke="#414b54" stroke-width="2" />
            <circle r="10.5" fill="#687580" stroke="#d9e0e5" stroke-width="1.4" />
            <g class="wheel">
              <path d="M0-9V9M-8-4.5 8 4.5M-8 4.5 8-4.5" stroke="#dce3e8" stroke-width="2" />
              <circle r="3" fill="#28343e" stroke="#c4cdd4" />
            </g>
          </g>
        {/each}
      </svg>
    </div>
  </div>
  <span class="arrow" aria-hidden="true"
    ><svg viewBox="0 0 32 32" fill="none"><path d="M7 25 25 7M8 7h17v17" /></svg></span
  >
</a>

<style>
  .discover {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 280px;
    padding: clamp(24px, 3vw, 44px);
    padding-bottom: 104px;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid var(--line);
    border-radius: 4px;
    color: var(--text);
    text-decoration: none;
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--text) 2%, transparent),
      transparent 65%
    );
    transition:
      border-color 350ms,
      box-shadow 350ms,
      transform 350ms;
  }
  .eyebrow {
    color: var(--muted);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  strong {
    margin-top: 19px;
    font-size: clamp(28px, 2.4vw, 39px);
    font-weight: 500;
    line-height: 1.12;
    letter-spacing: -0.045em;
  }
  .arrow {
    position: absolute;
    right: 27px;
    bottom: 30px;
    width: 31px;
    height: 31px;
    color: var(--text);
    transition: transform 350ms;
  }
  .arrow svg {
    width: 100%;
    height: 100%;
    stroke: currentColor;
    stroke-width: 1.4;
  }
  .road {
    position: absolute;
    bottom: 17px;
    right: 73px;
    width: min(170px, 55%);
    height: 78px;
    pointer-events: none;
  }
  .car {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: translateX(65px) scale(0.98);
    transition:
      opacity 160ms,
      transform 240ms ease-in;
  }
  .car svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .trail {
    position: absolute;
    left: -10px;
    right: 25px;
    bottom: 12px;
    height: 8px;
    border-block: 1px solid var(--muted);
    opacity: 0;
    transform-origin: right;
  }
  .discover:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 5px;
  }
  .discover:focus-visible {
    border-color: color-mix(in srgb, var(--line) 55%, var(--text));
    box-shadow: 0 0 22px color-mix(in srgb, var(--line) 30%, transparent);
  }
  .discover:focus-visible .car {
    opacity: 1;
    transform: none;
  }
  @media (hover: hover) {
    .discover:hover {
      border-color: color-mix(in srgb, var(--line) 55%, var(--text));
      box-shadow:
        0 0 22px color-mix(in srgb, var(--line) 30%, transparent),
        0 14px 30px #00000012;
    }
    .discover:hover .car {
      opacity: 1;
      transform: none;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .discover:focus-visible .car {
      animation: arrive 850ms both;
    }
    .discover:focus-visible .body {
      animation: idle 210ms 850ms infinite alternate;
    }
    .discover:focus-visible .wheel {
      animation: roll 600ms linear infinite;
    }
    @media (hover: hover) {
      .discover:hover {
        transform: translateY(-3px);
      }
      .discover:hover .arrow {
        transform: translate(2px, -2px);
      }
      .discover:hover .car {
        animation: arrive 850ms both;
      }
      .discover:hover .body {
        animation: idle 210ms 850ms infinite alternate;
      }
      .discover:hover .wheel {
        animation: roll 600ms linear infinite;
      }
      .discover:hover .trail {
        animation: skid 850ms both;
      }
    }
  }
  @keyframes arrive {
    0% {
      opacity: 0;
      transform: translate(-190px, 4px) rotate(-4deg);
    }
    14% {
      opacity: 1;
    }
    60% {
      transform: translate(9px, -1px) skewX(-7deg) rotate(2deg);
    }
    80% {
      transform: translate(-3px, 1px) skewX(2deg) rotate(-1deg);
    }
    100% {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes idle {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-0.55px);
    }
  }
  @keyframes roll {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes skid {
    0%,
    25% {
      opacity: 0;
      transform: scaleX(0.2);
    }
    58% {
      opacity: 0.24;
      transform: scaleX(1);
    }
    100% {
      opacity: 0;
      transform: scaleX(1.08);
    }
  }
  @media (max-width: 700px) {
    .discover {
      min-height: 250px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .discover,
    .arrow,
    .car {
      transition: none;
    }
  }
</style>

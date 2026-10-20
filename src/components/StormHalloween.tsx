import './StormHalloween.css';

/**
 * Vida sobre la imagen del inicio: tormenta (lluvia en dos capas, relámpagos
 * que iluminan las nubes) y, en temporada de Halloween, fantasmas, murciélagos,
 * calabazas encendidas y una araña colgando.
 *
 * Fluidez: todo es CSS que solo mueve, gira, escala o desvanece (transform /
 * opacity), lo que el navegador resuelve en la tarjeta gráfica; sin canvas ni
 * JS por cuadro. Nada recibe clics (pointer-events: none), así los botones de
 * la imagen siguen funcionando. Tamaños en cqw: escalan con el ancho de la
 * imagen, igual en teléfono y computador.
 */

/** Halloween: del 15 de octubre al 2 de noviembre; después desaparece solo. */
function isHalloweenSeason(d = new Date()): boolean {
  const m = d.getMonth();
  const day = d.getDate();
  return (m === 9 && day >= 15) || (m === 10 && day <= 2);
}

function Ghost() {
  return (
    <svg viewBox="0 0 100 110" className="lc-ghost__svg">
      <defs>
        <radialGradient id="lc-ghost-fill" cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.7" stopColor="#e6ecff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#c9d4ff" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <path
        d="M50 6C26 6 12 26 12 50v50l9.5-8 9.5 8 9.5-8 9.5 8 9.5-8 9.5 8 9.5-8 9.5 8V50C88 26 74 6 50 6Z"
        fill="url(#lc-ghost-fill)"
      />
      <ellipse cx="38" cy="44" rx="6" ry="9" fill="#14141c" />
      <ellipse cx="62" cy="44" rx="6" ry="9" fill="#14141c" />
      <ellipse cx="50" cy="66" rx="7" ry="9" fill="#14141c" />
    </svg>
  );
}

function Bat() {
  return (
    <svg viewBox="0 0 100 50" className="lc-bat__svg">
      <path
        d="M50 18c-3-6-8-6-8-6s2 5 1 8C36 12 22 6 4 10c8 4 12 10 13 18 5-4 12-4 16 1 3-5 9-6 12-2 1-3 3-5 5-5s4 2 5 5c3-4 9-3 12 2 4-5 11-5 16-1 1-8 5-14 13-18-18-4-32 2-39 10-1-3 1-8 1-8s-5 0-8 6Z"
        fill="#0b0b10"
      />
      <circle cx="47" cy="21" r="1.4" fill="#ff3b1f" />
      <circle cx="53" cy="21" r="1.4" fill="#ff3b1f" />
    </svg>
  );
}

function Pumpkin() {
  return (
    <svg viewBox="0 0 100 90" className="lc-pumpkin__svg">
      <path d="M50 14c-2-8 4-13 10-12-5 3-6 7-5 12Z" fill="#3d6b1e" />
      <ellipse cx="30" cy="54" rx="24" ry="32" fill="#d9600f" />
      <ellipse cx="70" cy="54" rx="24" ry="32" fill="#d9600f" />
      <ellipse cx="50" cy="54" rx="22" ry="34" fill="#f07a1a" />
      <path d="M30 22c-6 10-6 54 0 64M70 22c6 10 6 54 0 64" stroke="#b04e0a" strokeWidth="2" fill="none" />
      {/* Cara encendida */}
      <path d="M28 44l10-10 8 10ZM54 44l8-10 10 10Z" fill="#ffd34d" />
      <path d="M44 52l6-8 6 8Z" fill="#ffd34d" />
      <path d="M24 62q26 22 52 0l-6 4-6-4-7 6-7-6-7 6-7-6-6 4Z" fill="#ffd34d" />
    </svg>
  );
}

export function StormHalloween() {
  const halloween = isHalloweenSeason();
  return (
    <div className="lc-storm" aria-hidden="true">
      {/* Tormenta */}
      <div className="lc-flash" />
      <div className="lc-flash lc-flash--2" />
      <svg className="lc-bolt" viewBox="0 0 60 200" preserveAspectRatio="none">
        <polyline points="34,0 22,62 38,70 16,138 30,142 10,200" />
      </svg>
      <svg className="lc-bolt lc-bolt--2" viewBox="0 0 60 200" preserveAspectRatio="none">
        <polyline points="26,0 40,48 24,58 44,120 28,126 40,200" />
      </svg>
      <div className="lc-rain">
        <div className="lc-rain__layer lc-rain__layer--far" />
        <div className="lc-rain__layer lc-rain__layer--near" />
      </div>

      {halloween && (
        <>
          {/* Fantasmas rondando el cielo y la casa */}
          {[0, 1, 2].map((i) => (
            <div key={i} className={`lc-ghost lc-ghost--${i}`}>
              <div className="lc-ghost__bob">
                <Ghost />
              </div>
            </div>
          ))}
          {/* Murciélagos cruzando */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`lc-bat lc-bat--${i}`}>
              <div className="lc-bat__wave">
                <div className="lc-bat__flap">
                  <Bat />
                </div>
              </div>
            </div>
          ))}
          {/* Calabazas encendidas en el piso */}
          {[0, 1].map((i) => (
            <div key={i} className={`lc-pumpkin lc-pumpkin--${i}`}>
              <span className="lc-pumpkin__glow" />
              <Pumpkin />
            </div>
          ))}
          {/* Araña bajando de su hilo */}
          <div className="lc-spider">
            <span className="lc-spider__thread" />
            <div className="lc-spider__body">
              <svg viewBox="0 0 60 50">
                <g stroke="#0b0b10" strokeWidth="3" fill="none" strokeLinecap="round">
                  <path d="M22 22 8 10M22 26 4 24M22 30 6 40M24 34 12 48M38 22 52 10M38 26 56 24M38 30 54 40M36 34 48 48" />
                </g>
                <ellipse cx="30" cy="28" rx="11" ry="13" fill="#0b0b10" />
                <circle cx="26" cy="22" r="2" fill="#ff3b1f" />
                <circle cx="34" cy="22" r="2" fill="#ff3b1f" />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

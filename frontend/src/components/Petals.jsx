import { useEffect, useRef } from 'react';

/**
 * Recria a animação de pétalas de cerejeira do script.js original
 * (função criarPetals). Gera divs .petal com propriedades CSS
 * aleatórias (--dur, --delay, --dx, --dx-end, --rot-half, --rot-end)
 * que o style.css já sabe animar via @keyframes petal-fall.
 */
export default function Petals() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count = window.innerWidth < 768 ? 8 : 14;
    const petals = [];

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.style.left = Math.random() * 100 + 'vw';
      petal.style.setProperty('--dur', (8 + Math.random() * 10) + 's');
      petal.style.setProperty('--delay', (Math.random() * 12) + 's');
      petal.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      petal.style.setProperty('--dx-end', (Math.random() * 160 - 80) + 'px');
      petal.style.setProperty('--rot-half', (180 + Math.random() * 360) + 'deg');
      petal.style.setProperty('--rot-end', (360 + Math.random() * 720) + 'deg');
      petal.style.width = (10 + Math.random() * 8) + 'px';
      petal.style.height = (7 + Math.random() * 6) + 'px';
      container.appendChild(petal);
      petals.push(petal);
    }

    // Limpa ao desmontar (evita duplicar pétalas em re-renders do StrictMode)
    return () => {
      petals.forEach((p) => p.remove());
    };
  }, []);

  return <div aria-hidden="true" id="petals-container" ref={containerRef}></div>;
}

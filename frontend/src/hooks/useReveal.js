import { useEffect } from 'react';

/**
 * Recria o efeito de "reveal ao rolar a página" do script.js original:
 * observa todo elemento com classe .reveal e adiciona .visible quando
 * ele entra na viewport (o style.css já sabe animar essa transição).
 * Deve ser chamado uma vez, no componente raiz, depois que a página
 * (incluindo dados assíncronos) já está montada.
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    const elementos = document.querySelectorAll('.reveal:not(.visible)');
    if (!elementos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

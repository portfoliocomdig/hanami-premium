import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import useReveal from '../hooks/useReveal';

export default function Home() {
  useReveal();
  const heroRef = useRef(null);

  // Replica o efeito original: a imagem de fundo do hero começa levemente
  // ampliada (scale 1.05) e "assenta" suavemente para scale(1) assim que a
  // página carrega — o CSS já faz a transição de 8s, só precisamos
  // adicionar a classe .loaded no momento certo (via requestAnimationFrame,
  // igual ao script.js original).
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      heroRef.current?.classList.add('loaded');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main role="main">
      <section className="hero" id="hero" aria-label="Apresentação principal" ref={heroRef}>
        <div className="hero-bg" aria-hidden="true"></div>
        <div className="hero-overlay" aria-hidden="true"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" aria-hidden="true"></span>
            Delivery em Porto Alegre
          </div>
          <h1>Autêntica culinária<br /><strong>japonesa em sua casa</strong></h1>
          <p className="hero-sub">
            De Porto Alegre para a sua mesa. Sabor, tradição e frescor em cada detalhe, preparados
            artesanalmente pela família Yoshimoto Suwa.
          </p>
          <a href="#cardapio" className="hero-cta">
            Ver Cardápio
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </section>

      <ProductGrid />

      <section className="historia-section reveal" id="nossa-historia" aria-labelledby="historia-titulo">
        <div className="container">
          <div className="historia-grid">
            <article className="historia-img">
              <img src="/img/chef.jpeg" alt="Chef preparando a comida" loading="lazy" width="600" height="800" />
            </article>
            <div className="historia-text">
              <div className="section-label">Nossa História</div>
              <h2 id="historia-titulo">Duas gerações de paixão pela culinária japonesa</h2>
              <p>
                A jornada do Hanami começou décadas atrás, nas cozinhas de Kumamoto, onde a jovem{' '}
                <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Michiyo</strong> aprendeu com sua mãe os
                segredos do arroz perfeito, do corte preciso do peixe e do equilíbrio delicado entre sabores.
              </p>
              <p>
                Ao chegar ao Brasil com sua família, nos anos 50, Michiyo e sua mãe trouxeram uma filosofia: cada
                refeição é um momento de conexão. Em Porto Alegre, ela adaptou sua arte à disposição local de
                ingredientes frescos, sem jamais sacrificar a autenticidade.
              </p>
              <blockquote className="historia-quote">
                "Cozinhar é como cuidar de um jardim de cerejeiras — exige paciência, dedicação e amor em cada
                detalhe. Quando o prato chega à mesa, quero que a pessoa sinta o mesmo que eu sinto ao ver as
                flores abrirem na primavera."
              </blockquote>
              <p>
                Hoje, ao lado de seu filho{' '}
                <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Hideo Suwa</strong>, que cresceu entre panelas
                e facas, o Hanami nasce como a materialização desse legado.
              </p>
              <div className="historia-chefs">
                <div className="chef-info">
                  <div className="chef-avatar" aria-hidden="true">MS</div>
                  <div>
                    <div className="chef-name">Michiyo Suwa</div>
                    <div className="chef-role">Chef Fundadora</div>
                  </div>
                </div>
                <div className="chef-info">
                  <div className="chef-avatar" aria-hidden="true">HS</div>
                  <div>
                    <div className="chef-name">Hideo Suwa</div>
                    <div className="chef-role">Chef Executivo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="passos-section reveal" id="como-funciona" aria-labelledby="passos-titulo">
        <div className="container">
          <div>
            <div className="section-label">Como Funciona</div>
            <h2 id="passos-titulo">Da nossa cozinha à sua porta</h2>
            <p className="section-desc">
              Um processo pensado para garantir que cada prato chegue fresco, perfeito e no momento certo.
            </p>
          </div>
          <div className="passos-grid">
            <article className="passo-card" aria-label="Passo 1: Escolha seus pratos">
              <div className="passo-num" aria-hidden="true">01</div>
              <h3>Escolha seus pratos</h3>
              <p>Navegue pelo cardápio e monte sua refeição ideal. Sushi, sashimi, pratos quentes ou uma combinação completa.</p>
            </article>
            <article className="passo-card" aria-label="Passo 2: Confirme e pague">
              <div className="passo-num" aria-hidden="true">02</div>
              <h3>Confirme e pague</h3>
              <p>Revise seu pedido, escolha a forma de pagamento e finalize em segundos. Aceitamos cartão e PIX.</p>
            </article>
            <article className="passo-card" aria-label="Passo 3: Receba em casa">
              <div className="passo-num" aria-hidden="true">03</div>
              <h3>Receba em casa</h3>
              <p>Seu pedido é preparado na hora e entregue em embalagem térmica especial, preservando sabor e textura.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="depoimentos-section reveal" id="depoimentos" aria-labelledby="depo-titulo">
        <div className="container">
          <div>
            <div className="section-label">Avaliações</div>
            <h2 id="depo-titulo">O que dizem nossos clientes</h2>
          </div>
          <div className="depoimentos-grid">
            {[
              { nome: 'Carolina M.', desde: 'Cliente desde 2023', iniciais: 'CM', texto: '"O melhor sushi que já comi em Porto Alegre, sem exagero. O sabor é autêntico, o peixe incrivelmente fresco."' },
              { nome: 'Rafael T.', desde: 'Cliente desde 2024', iniciais: 'RT', texto: '"Pedi o Combo Especial Hanami para uma reunião em casa. A apresentação é de restaurante premium."' },
              { nome: 'Juliana P.', desde: 'Cliente desde 2023', iniciais: 'JP', texto: '"Sou intolerante a glúten e o Hanami tem opções claras e seguras. A atenção da equipe é impecável."' }
            ].map((d) => (
              <article className="depoimento-card" key={d.nome} aria-label={`Depoimento de ${d.nome}`}>
                <div className="depoimento-stars" aria-label="5 estrelas">★★★★★</div>
                <blockquote>{d.texto}</blockquote>
                <div className="depoimento-author">
                  <div className="depoimento-avatar" aria-hidden="true">{d.iniciais}</div>
                  <div>
                    <div className="depoimento-name">{d.nome}</div>
                    <div className="depoimento-detail">{d.desde}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section reveal" aria-label="Chamada para ação">
        <div>
          <h2>Experimente o sabor da tradição</h2>
          <p>Peça agora e receba em casa a experiência de um restaurante japonês autêntico.</p>
          <Link to="/#cardapio" className="cta-btn">Fazer Meu Pedido</Link>
        </div>
      </section>
    </main>
  );
}

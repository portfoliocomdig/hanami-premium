import { Link } from 'react-router-dom';

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">Hanami®</Link>
            <p>
              Culinária japonesa autêntica, preparada com tradição e amor em Porto Alegre. Da nossa
              cozinha para a sua mesa.
            </p>
            <div className="footer-social" aria-label="Redes sociais">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram do Hanami">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook do Hanami">Facebook</a>
              <a href="https://wa.me/555133484444" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp do Hanami">WhatsApp</a>
            </div>
          </div>

          <nav className="footer-col" aria-label="Links de navegação">
            <h4>Navegação</h4>
            <Link to="/#cardapio">Cardápio</Link>
            <Link to="/#nossa-historia">Nossa História</Link>
            <Link to="/#como-funciona">Como Funciona</Link>
            <Link to="/#depoimentos">Depoimentos</Link>
            <Link to="/pedidos">Meus Pedidos</Link>
          </nav>

          <div className="footer-col">
            <h4>Atendimento</h4>
            <a href="tel:+555133484444">(51) 3348-4444</a>
            <a href="mailto:contato@hanami.com.br">contato@hanami.com.br</a>
            <address>
              Rua das Cerejeiras, 128 — Moinhos de Vento<br />
              Porto Alegre, RS
            </address>
          </div>

          <div className="footer-col">
            <h4>Horário de Funcionamento</h4>
            <p>Terça a domingo<br />18h às 23h30</p>
            <p>Segundas-feiras: fechado</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {ano} Hanami® Culinária Japonesa. Todos os direitos reservados.</span>
          <span className="footer-seo">
            Delivery de comida japonesa em Porto Alegre · Sushi · Sashimi · Temaki · Ramen
          </span>
        </div>
      </div>
    </footer>
  );
}

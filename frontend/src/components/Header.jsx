import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { count, setIsOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header" id="site-header">
        <div className="header-inner">
          <Link to="/" className="logo" aria-label="Hanami — Página inicial">
            Hanami®
          </Link>

          <nav className="main-nav" aria-label="Navegação principal">
            <Link to="/#cardapio">Cardápio</Link>
            <Link to="/#nossa-historia">Nossa História</Link>
            <Link to="/#como-funciona">Como Funciona</Link>
            {isAuthenticated && <Link to="/pedidos">Meus Pedidos</Link>}
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <button className="btn-icon" onClick={logout} aria-label={`Sair (${user.name})`}>
                Sair
              </button>
            ) : (
              <Link className="btn-icon" to="/entrar" aria-label="Entrar">
                Entrar
              </Link>
            )}
            <button className="btn-icon" aria-label="Abrir carrinho de compras" onClick={() => setIsOpen(true)}>
              🛒<span className="cart-badge">{count}</span>
            </button>
            <button
              className={`hamburger ${menuOpen ? 'active' : ''}`}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-hidden={!menuOpen}>
        <Link className="mobile-nav-link" to="/#cardapio" onClick={() => setMenuOpen(false)}>Cardápio</Link>
        <Link className="mobile-nav-link" to="/#nossa-historia" onClick={() => setMenuOpen(false)}>Nossa História</Link>
        <Link className="mobile-nav-link" to="/#como-funciona" onClick={() => setMenuOpen(false)}>Como Funciona</Link>
      </div>
    </>
  );
}

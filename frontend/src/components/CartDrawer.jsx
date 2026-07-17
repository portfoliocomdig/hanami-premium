import { useNavigate } from 'react-router-dom';
import { useCart, TAXA_ENTREGA } from '../context/CartContext';

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, changeQuantity, removeItem, subtotal, total } = useCart();
  const navigate = useNavigate();

  const finalizarPedido = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} aria-hidden={!isOpen}></div>
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Carrinho de compras" aria-hidden={!isOpen}>
        <div className="cart-header">
          <h2>Seu Pedido</h2>
          <button className="cart-close" aria-label="Fechar carrinho" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="cart-items">
          {items.length === 0 && <p style={{ padding: '1rem' }}>Seu carrinho está vazio.</p>}
          {items.map(({ product, quantity }) => (
            <div className="cart-item" key={product.id}>
              <div className="cart-item-info">
                <strong>{product.name}</strong>
                <span>{formatarPreco(product.price)}</span>
              </div>
              <div className="cart-item-actions">
                <button className="qty-btn" onClick={() => changeQuantity(product.id, -1)} aria-label="Diminuir quantidade">-</button>
                <span>{quantity}</span>
                <button className="qty-btn" onClick={() => changeQuantity(product.id, 1)} aria-label="Aumentar quantidade">+</button>
                <button className="cart-item-remove" onClick={() => removeItem(product.id)} aria-label="Remover item">🗑</button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal</span>
                <span>{formatarPreco(subtotal)}</span>
              </div>
              <div className="cart-total-row">
                <span>Taxa de entrega</span>
                <span>{formatarPreco(TAXA_ENTREGA)}</span>
              </div>
              <div className="cart-total-row grand">
                <span>Total</span>
                <span>{formatarPreco(total)}</span>
              </div>
            </div>
            <button className="btn-checkout" onClick={finalizarPedido}>Finalizar Pedido</button>
          </div>
        )}
      </aside>
    </>
  );
}

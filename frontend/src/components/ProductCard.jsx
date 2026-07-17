import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIAS } from './Categories';

export default function ProductCard({ item }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const categoriaNome = CATEGORIAS.find((c) => c.id === item.category)?.nome || item.category;

  const handleAdd = () => {
    addItem(item);
    showToast(`${item.name} adicionado ao pedido`);
  };

  return (
    <article className="prato-card" role="listitem">
      <div className="prato-card-img">
        <img
          src={item.imageUrl ? `/img/${item.imageUrl}.jpeg` : `https://picsum.photos/seed/${item.id}/540/405.jpg`}
          alt={`${item.name} — ${item.description || ''}`}
          loading="lazy"
          width="540"
          height="405"
        />
        {item.featured && <span className="destaque-tag">Destaque</span>}
      </div>
      <div className="prato-card-body">
        <span className="prato-card-cat">{categoriaNome}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="prato-card-footer">
          <span className="prato-preco">
            <small>R$ </small>
            {Number(item.price).toFixed(2).replace('.', ',')}
          </span>
          <button className="btn-add" aria-label={`Adicionar ${item.name} ao carrinho`} onClick={handleAdd} disabled={item.stock === 0}>
            +
          </button>
        </div>
        {item.stock === 0 && <small style={{ color: 'var(--danger, #c0392b)' }}>Indisponível no momento</small>}
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_LABEL = {
  pending: 'Aguardando pagamento',
  paid: 'Pagamento confirmado',
  preparing: 'Em preparo',
  delivering: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Estornado'
};

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="container" style={{ margin: '3rem auto' }}>Carregando pedidos…</main>;

  return (
    <main className="container" style={{ margin: '3rem auto', maxWidth: 720 }}>
      <h2>Meus Pedidos</h2>
      {orders.length === 0 && <p>Você ainda não fez nenhum pedido.</p>}
      {orders.map((order) => (
        <article key={order.id} className="prato-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <strong>Pedido #{order.id.slice(0, 8)}</strong>
          <p>Status: {STATUS_LABEL[order.status] || order.status}</p>
          <p>Total: {formatarPreco(order.total)}</p>
          <ul>
            {order.items?.map((it) => (
              <li key={it.id}>{it.quantity}× {it.productName}</li>
            ))}
          </ul>
        </article>
      ))}
    </main>
  );
}

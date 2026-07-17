import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, TAXA_ENTREGA } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const enderecoInicial = { street: '', number: '', complement: '', neighborhood: '', city: 'Porto Alegre', state: 'RS', postalCode: '' };
const cartaoInicial = { number: '', holderName: '', expMonth: '', expYear: '', securityCode: '' };

export default function Checkout() {
  const { items, subtotal, total, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [endereco, setEndereco] = useState(enderecoInicial);
  const [metodo, setMetodo] = useState('credit_card');
  const [cartao, setCartao] = useState(cartaoInicial);
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [pixResult, setPixResult] = useState(null);

  if (!isAuthenticated) {
    return (
      <main className="container" style={{ margin: '4rem auto', maxWidth: 480 }}>
        <p>Você precisa entrar na sua conta para finalizar o pedido.</p>
        <button className="btn-checkout" onClick={() => navigate('/entrar')}>Ir para o login</button>
      </main>
    );
  }

  if (items.length === 0 && !pixResult) {
    return (
      <main className="container" style={{ margin: '4rem auto', maxWidth: 480 }}>
        <p>Seu carrinho está vazio.</p>
      </main>
    );
  }

  const handleEnderecoChange = (e) => setEndereco((s) => ({ ...s, [e.target.name]: e.target.value }));
  const handleCartaoChange = (e) => setCartao((s) => ({ ...s, [e.target.name]: e.target.value }));

  /**
   * Criptografa os dados do cartão no NAVEGADOR usando o SDK do PagBank
   * (carregado em index.html). O número/validade/CVV nunca são enviados
   * ao nosso back-end em texto puro — apenas o payload `encryptedCard`.
   */
  function encryptCard() {
    if (!window.PagSeguro) {
      throw new Error('SDK do PagBank não carregado. Verifique sua conexão e recarregue a página.');
    }
    const card = window.PagSeguro.encryptCard({
      publicKey: import.meta.env.VITE_PAGBANK_PUBLIC_KEY,
      holder: cartao.holderName,
      number: cartao.number.replace(/\s/g, ''),
      expMonth: cartao.expMonth,
      expYear: cartao.expYear,
      securityCode: cartao.securityCode
    });
    if (card.hasErrors) {
      throw new Error(card.errors.map((e) => e.message).join(' '));
    }
    return card.encryptedCard;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        paymentMethod: metodo,
        deliveryAddress: endereco
      };

      if (metodo === 'credit_card') {
        payload.card = { encrypted: encryptCard(), holderName: cartao.holderName };
        payload.installments = Number(installments);
      }

      const { data } = await api.post('/orders', payload);

      if (metodo === 'pix') {
        setPixResult({ order: data.order, qrText: data.order.pixQrCode });
        clear();
      } else {
        clear();
        navigate(`/pedidos/${data.order.id}`);
      }
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível concluir o pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (pixResult) {
    return (
      <main className="container" style={{ margin: '4rem auto', maxWidth: 520 }}>
        <h2>Pague com PIX para confirmar seu pedido</h2>
        <p>Escaneie o QR Code no app do seu banco ou copie o código abaixo. Ele expira em 30 minutos.</p>
        <textarea readOnly value={pixResult.qrText || ''} rows={5} style={{ width: '100%' }} />
        <button className="btn-checkout" onClick={() => navigator.clipboard.writeText(pixResult.qrText || '')}>
          Copiar código PIX
        </button>
        <p style={{ marginTop: '1rem' }}>
          Assim que o pagamento for confirmado pelo PagBank, o status do seu pedido é atualizado
          automaticamente.
        </p>
      </main>
    );
  }

  return (
    <main className="container" style={{ margin: '3rem auto', maxWidth: 640 }}>
      <h2>Finalizar Pedido</h2>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3>Resumo</h3>
        {items.map((i) => (
          <div className="cart-total-row" key={i.product.id}>
            <span>{i.quantity}× {i.product.name}</span>
            <span>{formatarPreco(i.product.price * i.quantity)}</span>
          </div>
        ))}
        <div className="cart-total-row"><span>Subtotal</span><span>{formatarPreco(subtotal)}</span></div>
        <div className="cart-total-row"><span>Entrega</span><span>{formatarPreco(TAXA_ENTREGA)}</span></div>
        <div className="cart-total-row grand"><span>Total</span><span>{formatarPreco(total)}</span></div>
      </section>

      <form onSubmit={handleSubmit} noValidate>
        <h3>Endereço de entrega</h3>
        <label>Rua<input name="street" required value={endereco.street} onChange={handleEnderecoChange} /></label>
        <label>Número<input name="number" required value={endereco.number} onChange={handleEnderecoChange} /></label>
        <label>Complemento<input name="complement" value={endereco.complement} onChange={handleEnderecoChange} /></label>
        <label>Bairro<input name="neighborhood" value={endereco.neighborhood} onChange={handleEnderecoChange} /></label>
        <label>Cidade<input name="city" required value={endereco.city} onChange={handleEnderecoChange} /></label>
        <label>UF<input name="state" required maxLength={2} value={endereco.state} onChange={handleEnderecoChange} /></label>
        <label>CEP<input name="postalCode" required placeholder="00000-000" value={endereco.postalCode} onChange={handleEnderecoChange} /></label>

        <h3>Forma de pagamento</h3>
        <label>
          <input type="radio" name="metodo" checked={metodo === 'credit_card'} onChange={() => setMetodo('credit_card')} />
          {' '}Cartão de crédito
        </label>
        <label>
          <input type="radio" name="metodo" checked={metodo === 'pix'} onChange={() => setMetodo('pix')} />
          {' '}PIX
        </label>

        {metodo === 'credit_card' && (
          <div style={{ marginTop: '1rem' }}>
            <label>Nome impresso no cartão<input name="holderName" required value={cartao.holderName} onChange={handleCartaoChange} /></label>
            <label>Número do cartão<input name="number" required inputMode="numeric" value={cartao.number} onChange={handleCartaoChange} /></label>
            <label>Mês de validade (MM)<input name="expMonth" required maxLength={2} value={cartao.expMonth} onChange={handleCartaoChange} /></label>
            <label>Ano de validade (AAAA)<input name="expYear" required maxLength={4} value={cartao.expYear} onChange={handleCartaoChange} /></label>
            <label>CVV<input name="securityCode" required maxLength={4} value={cartao.securityCode} onChange={handleCartaoChange} /></label>
            <label>
              Parcelas
              <select value={installments} onChange={(e) => setInstallments(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}x</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {erro && <p role="alert" style={{ color: '#c0392b' }}>{erro}</p>}

        <button className="btn-checkout" type="submit" disabled={loading}>
          {loading ? 'Processando…' : `Pagar ${formatarPreco(total)}`}
        </button>
      </form>
    </main>
  );
}

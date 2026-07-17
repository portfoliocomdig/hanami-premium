import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from './ProductCard';
import Categories from './Categories';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [categoria, setCategoria] = useState('todos');
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    const params = {};
    if (categoria !== 'todos') params.category = categoria;
    if (sort !== 'default') params.sort = sort;

    api
      .get('/products', { params })
      .then(({ data }) => {
        if (ativo) setProducts(data.products);
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar o cardápio agora. Tente novamente em instantes.');
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => { ativo = false; };
  }, [categoria, sort]);

  return (
    <section className="cardapio-section" id="cardapio" aria-label="Cardápio completo">
      <div className="container">
        <div className="cardapio-header reveal">
          <div>
            <div className="section-label">Cardápio</div>
            <h2>Pratos selecionados</h2>
          </div>
          <label>
            Ordenar por:{' '}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Mais recentes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="name">Nome (A-Z)</option>
            </select>
          </label>
        </div>
      </div>

      <Categories ativa={categoria} onChange={setCategoria} />

      <div className="container">
        {loading && <p>Carregando cardápio…</p>}
        {erro && <p role="alert">{erro}</p>}
        {!loading && !erro && (
          <div className="cardapio-grid" role="list" aria-label="Lista de pratos">
            {products.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
            {products.length === 0 && <p>Nenhum prato encontrado nesta categoria.</p>}
          </div>
        )}
      </div>
    </section>
  );
}

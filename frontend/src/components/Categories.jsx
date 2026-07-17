const CATEGORIAS = [
  { id: 'todos', nome: 'Todos' },
  { id: 'sushi', nome: 'Sushi' },
  { id: 'sashimi', nome: 'Sashimi' },
  { id: 'chuukaman', nome: 'Chuukaman' },
  { id: 'temaki', nome: 'Temakis' },
  { id: 'nigiri', nome: 'Nigiris' },
  { id: 'quentes', nome: 'Pratos Quentes' },
  { id: 'entradas', nome: 'Entradas' },
  { id: 'sobremesas', nome: 'Sobremesas' }
];

export default function Categories({ ativa, onChange }) {
  return (
    <section className="categorias-section" aria-label="Filtro de categorias">
      <div className="container">
        <div className="categorias-grid" role="tablist" aria-label="Categorias do cardápio">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              className={`cat-btn ${ativa === cat.id ? 'active' : ''}`}
              role="tab"
              aria-selected={ativa === cat.id}
              onClick={() => onChange(cat.id)}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export { CATEGORIAS };

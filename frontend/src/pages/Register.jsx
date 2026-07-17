import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', taxId: '' });
  const [erros, setErros] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Validação básica no cliente (a validação definitiva é sempre feita no servidor)
  const validarLocal = () => {
    const problemas = [];
    if (form.name.trim().length < 2) problemas.push('Nome deve ter ao menos 2 caracteres.');
    if (!/\S+@\S+\.\S+/.test(form.email)) problemas.push('E-mail inválido.');
    if (form.password.length < 8 || !/\d/.test(form.password) || !/[A-Za-z]/.test(form.password)) {
      problemas.push('Senha deve ter 8+ caracteres, com letras e números.');
    }
    return problemas;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problemas = validarLocal();
    if (problemas.length) {
      setErros(problemas);
      return;
    }
    setErros([]);
    setLoading(true);
    try {
      await register(form);
      showToast('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (err) {
      const apiErrors = err.response?.data?.errors?.map((e) => e.mensagem) || [err.response?.data?.message || 'Erro ao cadastrar.'];
      setErros(apiErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 480, margin: '4rem auto' }}>
      <h2>Criar Conta</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Nome completo
          <input name="name" required value={form.name} onChange={handleChange} />
        </label>
        <label>
          E-mail
          <input type="email" name="email" required value={form.email} onChange={handleChange} />
        </label>
        <label>
          Senha (mín. 8 caracteres, com letra e número)
          <input type="password" name="password" required value={form.password} onChange={handleChange} />
        </label>
        <label>
          Telefone (opcional)
          <input name="phone" placeholder="(51) 99999-9999" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          CPF (necessário para pagamento via PagBank)
          <input name="taxId" placeholder="Somente números" value={form.taxId} onChange={handleChange} />
        </label>

        {erros.length > 0 && (
          <ul role="alert" style={{ color: '#c0392b' }}>
            {erros.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}

        <button className="btn-checkout" type="submit" disabled={loading}>
          {loading ? 'Cadastrando…' : 'Cadastrar'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </main>
  );
}

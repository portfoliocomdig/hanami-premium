import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Login realizado com sucesso!');
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível entrar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 420, margin: '4rem auto' }}>
      <h2>Entrar</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          E-mail
          <input type="email" name="email" required value={form.email} onChange={handleChange} />
        </label>
        <label>
          Senha
          <input type="password" name="password" required value={form.password} onChange={handleChange} />
        </label>
        {erro && <p role="alert" style={{ color: '#c0392b' }}>{erro}</p>}
        <button className="btn-checkout" type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </main>
  );
}

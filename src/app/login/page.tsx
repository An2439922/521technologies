"use client";

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        window.location.href = '/'; // Полная перезагрузка для обновления middleware
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка входа');
      }
    } catch (e) {
      setError('Ошибка сети. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem 2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Клуб Путешествий "Маруссия". Заявки.</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>Ну что, поработаем? 😉</p>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Логин</label>
            <input 
              required 
              type="text" 
              name="username"
              autoComplete="username"
              className="form-input" 
              placeholder="Введите логин"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input 
              required 
              type="password" 
              name="password"
              autoComplete="current-password"
              className="form-input" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

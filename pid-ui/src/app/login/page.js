"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css';
import '../styles.css';
import signIn from '../firebase/auth/signin';
import { useRouter } from 'next/navigation'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter()


  const handleLogin = async (e) => {
    e.preventDefault();

    const { result, error } = await signIn(email, password);

    if (error) {
      setError('Usuario o contraseña incorrectos');  
      return console.log(error)
    }

    console.log(result)
    return router.push("/admin")
  };

  return (
    <div className={styles['login-page']}>
      <div className="title">Iniciar Sesión</div>
      <form className={styles['login-form']} onSubmit={handleLogin}>
        <div className={styles['form-group']}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className={styles['error-message']}>{error}</div>}
        <button type="submit" className="button">Iniciar Sesión</button>
      </form>
      <div className={styles['register-link']}>
        ¿No tienes una cuenta?{' '}
        <Link legacyBehavior href="/">
          <a>Registrarse</a>
        </Link>
      </div>
    </div>
  );
};

export default Login;

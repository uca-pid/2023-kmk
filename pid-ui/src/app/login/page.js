"use client"; // This is a client component 👈🏽


import React, { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css'; // Estilos específicos de Login
import '../styles.css'; // Importa estilos generales

const login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    // Aquí puedes agregar la lógica de autenticación
    // por ejemplo, usando una API o una base de datos

    // Si hay un error en la autenticación, muestra el mensaje de error
    setError('Usuario o contraseña incorrectos');

    // Si la autenticación es exitosa, puedes redirigir al usuario a la página principal
  };

  return (
    <div className={styles['login-page']}>
      <div className="title">Iniciar Sesión</div>
      <form className={styles['login-form']} onSubmit={handleLogin}>
        {error && <div className={styles['error-message']}>{error}</div>}
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

export default login;

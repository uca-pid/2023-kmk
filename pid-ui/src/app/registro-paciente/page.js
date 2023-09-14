"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './registro-paciente.module.css';

const RegistroPaciente = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    //logica de handling
  };

  return (
    <div className={styles['registro-paciente']}>
      <h1>Registro de Paciente</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            id="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>
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
        <button type="submit" className={styles['cta-button']}>Registrarse</button>
      </form>
      <p>
        ¿Ya tienes una cuenta?{' '}
        <Link legacyBehavior href="/login">
          <a>Iniciar Sesión</a>
        </Link>
      </p>
    </div>
  );
};

export default RegistroPaciente;
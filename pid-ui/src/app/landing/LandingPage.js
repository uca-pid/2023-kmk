import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

const LandingPage = () => {
  return (
    <div className={styles['landing-page']}>
      <div className={styles['landing-page-header']}>
        <h1>Sistema de Gestión Médica</h1>
      </div>
      <div className={styles['main-content']}>
        <p>Bienvenido al Sistema de Gestión Médica. Regístrese como paciente o médico para comenzar.</p>
      </div>
      {/* Sección de Registro */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>Registro</h2>
        <p className={styles['section-paragraph']}>Regístrese como paciente o médico para acceder a nuestros servicios.</p>
        <div className={styles['cta-buttons']}>
          <Link href="/registro-paciente" passHref={true} legacyBehavior={true}>
            <a className={styles['cta-button']}>Registrarse como Paciente</a>
          </Link>
          <Link href="/registro-medico" passHref={true} legacyBehavior={true}>
            <a className={styles['cta-button']}>Registrarse como Médico</a>
          </Link>
        </div>
      </div>
      {/* Sección de Inicio de Sesión */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>Iniciar Sesión</h2>
        <div className={styles['cta-buttons']}>
          <Link href="/login" passHref={true} legacyBehavior={true}>
            <a className={styles['cta-button']}>Iniciar Sesión</a>
          </Link>
        </div>
      </div>
      <footer className={styles['landing-page-footer']}>
        <p>Derechos de autor © 2023 Sistema de Gestión Médica</p>
      </footer>
    </div>
  );
};

export default LandingPage;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header} onClick={handleLogoClick}>
        <img src="/logo.png" alt="Logo de la empresa" className={styles.logo} />
      </header>

      {/* Barra superior de navegación por pestañas */}
      <div className={styles["tab-bar"]}>
        <div className={styles.tab}>Turnos</div>
        {/* Agrega más pestañas según tus necesidades */}
      </div>

      {/* Contenido de la pestaña "Turnos" */}
      <div className={styles["tab-content"]}>
        {/* Formulario de selección de especialidad y doctor */}
        <div className={styles.form}>
          <label htmlFor="especialidad">Especialidad:</label>
          <select id="especialidad">{/* Opciones de especialidad */}</select>
          <label htmlFor="doctor">Doctor:</label>
          <select id="doctor">{/* Opciones de doctor */}</select>
        </div>

        {/* Calendario para seleccionar fecha y horario */}
        <div className={styles.calendar}>{/* Calendario aquí */}</div>
      </div>

      <footer className={styles["page-footer"]}>
        <p>Derechos de autor © 2023 KMK</p>
      </footer>
    </div>
  );
};

export default Dashboard;

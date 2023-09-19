"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [especialidad, setEspecialidad] = useState("");
  const [doctor, setDoctor] = useState("");
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);

  // Función para cargar los turnos disponibles cuando cambian especialidad o doctor
  const cargarTurnosDisponibles = async () => {
    try {
      // Realiza una solicitud al backend para obtener los turnos disponibles
      const response = await fetch(
        `/api/turnos?especialidad=${especialidad}&doctor=${doctor}`
      );
      if (response.ok) {
        const data = await response.json();
        setTurnosDisponibles(data.turnos);
      } else {
        console.error("Error al cargar los turnos disponibles.");
      }
    } catch (error) {
      console.error("Error al cargar los turnos disponibles:", error);
    }
  };

  useEffect(() => {
    // Cargar los turnos disponibles cuando cambian especialidad o doctor
    cargarTurnosDisponibles();
  }, [especialidad, doctor]);

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
        <div className={styles.tab} onClick={router.push("/dashboard")}>
          Turnos
        </div>
        <div className={styles.disabledtab}>Mi Ficha (Coming soon)</div>

        {/* Agrega más pestañas según tus necesidades */}
      </div>

      {/* Contenido de la pestaña "Turnos" */}
      <div className={styles["tab-content"]}>
        {/* Formulario de selección de especialidad y doctor */}
        <div className={styles.form}>
          <label htmlFor="especialidad">Especialidad:</label>
          <select
            id="especialidad"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
          >
            {/* Opciones de especialidad */}
          </select>
          <label htmlFor="doctor">Doctor:</label>
          <select
            id="doctor"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
          >
            {/* Opciones de doctor */}
          </select>
        </div>

        {/* Lista de turnos disponibles */}
        <div className={styles["turnos-disponibles"]}>
          <h2>Turnos Disponibles</h2>
          <ul>
            {turnosDisponibles.map((turno, index) => (
              <li key={index}>{turno}</li>
            ))}
          </ul>
        </div>
      </div>

      <footer className={styles["page-footer"]}>
        <p>Derechos de autor © 2023 KMK</p>
      </footer>
    </div>
  );
};

export default Dashboard;

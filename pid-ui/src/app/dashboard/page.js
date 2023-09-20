"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [especialidad, setEspecialidad] = useState("");
  // Estado para almacenar la lista de especialidades
  const [especialidades, setEspecialidades] = useState([]);
  // Estado para almacenar la lista de médicos
  const [medicos, setMedicos] = useState([]);
  // Estado para almacenar los turnos disponibles
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  // Estado para el valor seleccionado de la especialidad
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  // Estado para el valor seleccionado del médico
  const [selectedMedico, setSelectedMedico] = useState("");

  // Efecto para cargar las especialidades al cargar la página
  useEffect(() => {
    // Llamada a la API para obtener la lista de especialidades
    fetch("/api/especialidades")
      .then((response) => response.json())
      .then((data) => {
        setEspecialidades(data);
      })
      .catch((error) => {
        console.error("Error al obtener las especialidades:", error);
      });
  }, []);

  // Efecto para cargar los médicos cuando se selecciona una especialidad
  useEffect(() => {
    if (selectedEspecialidad) {
      // Llamada a la API para obtener la lista de médicos para la especialidad seleccionada
      fetch(`/api/medicos?especialidad=${selectedEspecialidad}`)
        .then((response) => response.json())
        .then((data) => {
          setMedicos(data);
        })
        .catch((error) => {
          console.error("Error al obtener los médicos:", error);
        });
    } else {
      // Si no se selecciona una especialidad, borra la lista de médicos
      setMedicos([]);
    }
  }, [selectedEspecialidad]);

  // Efecto para cargar los turnos disponibles cuando se selecciona un médico
  useEffect(() => {
    if (selectedMedico) {
      // Llamada a la API para obtener los turnos disponibles para el médico seleccionado
      fetch(`/api/turnos?medico=${selectedMedico}`)
        .then((response) => response.json())
        .then((data) => {
          setTurnosDisponibles(data);
        })
        .catch((error) => {
          console.error("Error al obtener los turnos disponibles:", error);
        });
    } else {
      // Si no se selecciona un médico, borra la lista de turnos disponibles
      setTurnosDisponibles([]);
    }
  }, [selectedMedico]);

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header} onClick={handleLogoClick}>
        <img src="/logo.png" alt="Logo de la empresa" className={styles.logo} />
      </header>

      <div className={styles["tab-bar"]}>
        <div className={styles.tab} onClick={handleLogoClick}>
          Turnos
        </div>
        <div className={styles.tab_disabled}>Mi Ficha (Coming soon)</div>
      </div>

      <div className={styles["tab-content"]}>
        {/* Formulario de selección de especialidad y doctor */}
        <div className={styles.form}>
          {/* Selector de especialidades */}
          <label htmlFor="especialidad">Especialidad:</label>
          <select
            id="especialidad"
            value={selectedEspecialidad}
            onChange={(e) => setSelectedEspecialidad(e.target.value)}
          >
            <option value="">Selecciona una especialidad</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>
                {especialidad.nombre}
              </option>
            ))}
          </select>

          {/* Selector de médicos */}
          <label htmlFor="medico">Médico:</label>
          <select
            id="medico"
            value={selectedMedico}
            onChange={(e) => setSelectedMedico(e.target.value)}
            disabled={!selectedEspecialidad} // Deshabilita si no se ha seleccionado una especialidad
          >
            <option value="">Selecciona un médico</option>
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.nombre}
              </option>
            ))}
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./registro-medico.module.css";
import signUp from "../firebase/auth/signup";

const RegistroMedico = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("medico");

  const handleSubmit = async (e) => {
    e.preventDefault();
    //logica de handling
    const { result, error } = await signUp(email, password, role);

    if (error) {
      setError("Usuario o contraseña incorrectos");
      return console.log(error);
    }

    console.log(result);
    return router.push("/admin");
  };

  return (
    <div className={styles["registro-medico"]}>
      <h1>Registro de Médico</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles["form-group"]}>
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            id="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="especialidad">Especialidad</label>
          <input
            type="text"
            id="especialidad"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles["cta-button"]}>
          Registrarse
        </button>
      </form>
      <p>
        ¿Ya tienes una cuenta?{" "}
        <Link legacyBehavior href="/login">
          <a>Iniciar Sesión</a>
        </Link>
      </p>
    </div>
  );
};

export default RegistroMedico;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./registro.module.css";
import signUp from "../firebase/auth/signup";
import { useRouter } from "next/navigation"; // Importa el enrutador de Next.js

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("medico");
  const router = useRouter(); // Inicializa el enrutador

  const handleLogoClick = () => {
    // Navega al home cuando se hace clic en el logo
    router.push("/");
  };

  const handleSubmit = async (e) => {
    console.log("handleSubmit");
    e.preventDefault();
    const { result, error } = await signUp(email, password, role);

    if (error) {
      setError("Usuario o contraseña incorrectos");
      return console.log(error);
    }

    console.log(result);
    return router.push("/");
  };

  return (
    <div className={styles["registro"]}>
      <header className={styles["header"]} onClick={handleLogoClick}>
        <img
          src="/logo.png" // Reemplaza con la ruta de tu logo
          alt="Logo de la empresa"
          className={styles["logo"]}
        />
      </header>
      <div className={styles["title"]}>Registro</div>
      <div className={styles["subtitle"]}>Ingrese sus datos para comenzar</div>
      <form className={styles["form"]} onSubmit={handleSubmit}>
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
      <footer className={styles["page-footer"]}>
        <p>Derechos de autor © 2023 KMK</p>
      </footer>
    </div>
  );
};

export default Registro;

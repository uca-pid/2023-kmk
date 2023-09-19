"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./registro.module.css";
import signUp from "../firebase/auth/signup";
import { useRouter } from "next/navigation"; // Importa el enrutador de Next.js
import axios from "axios";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [numeroMatricula, setNumeroMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("paciente");
  const router = useRouter(); // Inicializa el enrutador

  const handleLogoClick = () => {
    // Navega al home cuando se hace clic en el logo
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //const { result, error } = await signUp(email, password, role);
    const userData = {
      nombre,
      apellido,
      numeroMatricula,
      especialidad,
      email,
      password,
      role: role, // Asegúrate de incluir el rol en los datos
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/register",
        userData
      );
      console.log(response.data); // Esto mostrará la respuesta del backend en la consola del navegador
      // Realiza acciones adicionales en función de la respuesta, como redirigir al usuario
      if (response.data) {
        // Usuario inició sesión exitosamente, puedes mostrar un mensaje de éxito.
        console.log("Registro exitoso");
        // Redirige al usuario a la página home u otra página deseada.
        //router.push("/");
      }
    } catch (error) {
      console.error(error);
      // Maneja los errores, como mostrar mensajes al usuario
    }

    /*if (error) {
      setError("Usuario o contraseña incorrectos");
      return console.log(error);
    }

    console.log(result);
    return router.push("/");*/
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
          <label htmlFor="userType">Tipo de Usuario</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="paciente">Paciente</option>
            <option value="medico">Médico</option>
          </select>
        </div>
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
        {role === "medico" && (
          <>
            <div className={styles["form-group"]}>
              <label htmlFor="numeroMatricula">Número de Matrícula</label>
              <input
                type="text"
                id="numeroMatricula"
                value={numeroMatricula}
                onChange={(e) => setNumeroMatricula(e.target.value)}
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
          </>
        )}
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
        <div className={styles["form-group"]}>
          <label htmlFor="confirmPassword">Repetir Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {password !== confirmPassword && (
          <div className={styles["error-message"]}>
            Las contraseñas no coinciden.
          </div>
        )}
        <button
          type="submit"
          className={`${styles["cta-button"]} ${
            password !== confirmPassword ? styles["disabled-button"] : ""
          }`}
          disabled={password !== confirmPassword}
        >
          Registrarse
        </button>
      </form>
      <div className={styles["sign-in-link"]}>
        ¿Ya tienes una cuenta?{" "}
        <Link legacyBehavior href="/">
          <a>Inicia Sesión</a>
        </Link>
      </div>
      <footer className={styles["page-footer"]}>
        <p>Derechos de autor © 2023 KMK</p>
      </footer>
    </div>
  );
};

export default Registro;

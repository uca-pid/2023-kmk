"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./landing.module.css";
import signIn from "../firebase/auth/signin";
import { useRouter } from "next/navigation"; // Importa el enrutador de Next.js
import axios from "axios";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Inicializa el enrutador

  const handleLogoClick = () => {
    // Navega al home cuando se hace clic en el logo
    router.push("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        `http://localhost:8080/users/login`,
        userData
      );
      console.log(response.data);

      // Usuario inició sesión exitosamente, puedes mostrar un mensaje de éxito.
      console.log("Inicio de sesión exitoso");
      // Redirige al usuario a la página principal u otra página deseada.
      router.push("/dashboard");

      // Usuario inició sesión exitosamente, redirige o realiza otras acciones necesarias.
    } catch (error) {
      setError("Error al iniciar sesión: " + error.response.data.detail);

      // Verificar si el elemento .error-message está presente en el DOM
      const errorMessageElement = document.querySelector(".error-message");
      if (errorMessageElement) {
        errorMessageElement.style.visibility = "visible"; // Muestra el mensaje de error
      }

      return console.log(error);

      // Error en la función signIn, manejar de acuerdo a tus necesidades.
      console.error(error);
    }
  };

  return (
    <div className={styles["login-page"]}>
      <header className={styles["header"]} onClick={handleLogoClick}>
        <img
          src="/logo.png" // Reemplaza con la ruta de tu logo
          alt="Logo de la empresa"
          className={styles["logo"]}
        />
      </header>
      <div className={styles["login-form-container"]}>
        <div className={styles["title"]}>¡Bienvenido!</div>
        <div className={styles["subtitle"]}>Iniciar Sesion</div>
        <form className={styles["form"]} onSubmit={handleLogin}>
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
          {error && <div className={styles["error-message"]}>{error}</div>}
          <button type="submit" className={styles["cta-button"]}>
            Iniciar Sesión
          </button>
        </form>
        <div className={styles["register-link"]}>
          ¿No tienes una cuenta?{" "}
          <Link legacyBehavior href="/registro">
            <a>Registrarse</a>
          </Link>
        </div>
      </div>
      <footer className={styles["page-footer"]}>
        <p>Derechos de autor © 2023 KMK</p>
      </footer>
    </div>
  );
};

export default Landing;

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./landing.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";

const Landing = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        localStorage.setItem("token", "");
    }, []);

    const handleLogoClick = () => {
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
            localStorage.setItem("token", response.data.token);
            console.log("Token recibido: " + response.data.token);
            console.log("Token almacenado: " + localStorage.getItem("token"));

            router.push("/dashboard");
        } catch (error) {
            setError("Error al iniciar sesión: " + error.response.data.detail);

            // Verificar si el elemento .error-message está presente en el DOM
            const errorMessageElement =
                document.querySelector(".error-message");
            if (errorMessageElement) {
                errorMessageElement.style.visibility = "visible"; // Muestra el mensaje de error
            }

            return console.log(error);
        }
    };

    return (
        <div className={styles["login-page"]}>
            <header className={styles["header"]} onClick={handleLogoClick}>
                <Image
                    src="/logo.png"
                    alt="Logo de la empresa"
                    className={styles["logo"]}
                    width={200}
                    height={200}
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
                    {error && (
                        <div className={styles["error-message"]}>{error}</div>
                    )}
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

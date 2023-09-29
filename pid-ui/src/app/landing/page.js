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
        localStorage.removeItem("token");
        axios.defaults.headers.common = {
            Authorization: `bearer`,
        };
    }, []);

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
            router.push("/dashboard-redirect");
        } catch (error) {
            setError("Error al iniciar sesión: " + error.response.data.detail);

            if (error.response.data.detail == "User has already logged in") {
                router.push("/dashboard-redirect");
            }

            // Verificar si el elemento .error-message está presente en el DOM
            const errorMessageElement =
                document.querySelector(".error-message");
            if (errorMessageElement) {
                errorMessageElement.style.visibility = "visible"; // Muestra el mensaje de error
            }
        }
    };

    return (
        <div className={styles["login-page"]}>
            <header className={styles["header"]}>
                <Link href="/">
                    <img
                        src="/logo.png"
                        alt="logo"
                        className={styles["logo"]}
                    />
                </Link>
            </header>
            <form className={styles["form"]} onSubmit={handleLogin}>
                <div className={styles["title"]}>¡Bienvenido!</div>
                <div className={styles["subtitle"]}>Iniciar Sesion</div>
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
                <div className={styles["register-link"]}>
                    ¿No tienes una cuenta?{" "}
                    <Link legacyBehavior href="/registro">
                        <a>Registrarse</a>
                    </Link>
                </div>
            </form>

            <footer>
                <p>Derechos de autor © 2023 KMK</p>
            </footer>
        </div>
    );
};

export default Landing;

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./landing.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import https from "https";
import { Footer, HeaderSlim } from "../components/header";
import { loginCheck } from "../components/userCheck";
import { toast } from "react-toastify";

const Landing = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    useEffect(() => {
        console.log(process.env.NEXT_PUBLIC_API_URL);
        console.log(apiURL);

        loginCheck(router);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        toast.info("Iniciando sesión...");
        localStorage.removeItem("token");
        axios.defaults.headers.common = {
            Authorization: `bearer`,
        };

        const userData = {
            email,
            password,
        };

        try {
            const response = await axios.post(
                `${apiURL}users/login/`,
                userData,
                {
                    httpsAgent: agent,
                }
            );
            localStorage.setItem("token", response.data.token);
            loginCheck(router);
        } catch (error) {
            console.error(error);
            toast.error(
                "Error al iniciar sesión: " + error.response.data.detail
            );
        }
    };

    return (
        <div className={styles["login-page"]}>
            <HeaderSlim />
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
                <button type="submit" className={styles["cta-button"]}>
                    Iniciar Sesión
                </button>
                <div className={styles["register-link"]}>
                    {" "}
                    <Link legacyBehavior href="/registro">
                        <a>¿No tienes una cuenta? Registrarse</a>
                    </Link>
                </div>
            </form>
            <Footer />
        </div>
    );
};

export default Landing;

"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import axios from "axios";
import { Footer, Header } from "../components/header";

const UserProfile = () => {
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        // Aquí puedes realizar una solicitud a la API para obtener los datos del usuario
        // Reemplaza 'getUserData' con la función o endpoint adecuado para obtener los datos del usuario
        getUserData()
            .then((data) => {
                setUser(data);
            })
            .catch((error) => {
                console.error("Error al obtener los datos del usuario:", error);
            });
    }, []);

    const getUserData = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/user-info/`
            );
            console.log(response);
        } catch (error) {
            throw error;
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            // Realiza una solicitud a la API para cambiar la contraseña
            await axios.post("/api/change-password", {
                currentPassword: password,
                newPassword: newPassword,
            });

            setSuccessMessage("Contraseña cambiada exitosamente.");
            setPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setError("");
        } catch (error) {
            setError(
                "Error al cambiar la contraseña: " + error.response.data.detail
            );
        }
    };

    return (
        <div className={styles.dashboard}>
            <Header />

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    {/* Datos del usuario */}
                    <div className={styles["title"]}>Datos del Usuario</div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="firstName">Nombre:</label>
                        <input
                            type="text"
                            id="firstName"
                            value={user.firstName}
                            readOnly
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="lastName">Apellido:</label>
                        <input
                            type="text"
                            id="lastName"
                            value={user.lastName}
                            readOnly
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="email">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            value={user.email}
                            readOnly
                        />
                    </div>

                    {/* Cambio de Contraseña */}
                    <div className={styles["title"]}>Cambiar Contraseña</div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="currentPassword">
                            Contraseña Actual:
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="newPassword">Nueva Contraseña:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles["form-group"]}>
                        <label htmlFor="confirmNewPassword">
                            Confirmar Nueva Contraseña:
                        </label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) =>
                                setConfirmNewPassword(e.target.value)
                            }
                            required
                        />
                    </div>
                    {error && (
                        <div className={styles["error-message"]}>{error}</div>
                    )}
                    {successMessage && (
                        <div className={styles["success-message"]}>
                            {successMessage}
                        </div>
                    )}
                    <button
                        type="button"
                        className={`${styles["standard-button"]}`}
                        onClick={handleChangePassword}
                    >
                        Cambiar Contraseña
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserProfile;

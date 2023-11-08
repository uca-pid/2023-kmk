"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import axios from "axios";
import { userCheck } from "../components/userCheck";
import { useRouter } from "next/navigation";
import validator from "validator";
import { Footer, Header, TabBar } from "../components/header";
import { toast } from "react-toastify";

const UserProfile = () => {
    const router = useRouter();
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        bloodtype: "",
    });
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const validate = (value) => {
        if (
            validator.isStrongPassword(value, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 0,
            })
        ) {
            setError("");
        } else {
            toast.error(
                "La contraseña no es lo suficientemente fuerte: debe incluir al menos 8 caracteres, 1 minúscula, 1 mayúscula y 1 número"
            );
        }
    };

    const getUserData = async () => {
        try {
            const response = await axios.get(`${apiURL}users/user-info`);

            console.log(response);

            let user = {
                firstName: response.data.first_name,
                lastName: response.data.last_name,
                email: response.data.email,
                bloodtype: response.data.blood_type,
            };
            setUser(user);
        } catch (error) {
            console.error(error);
            toast.error("Error al obtener los datos del usuario");
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        validate(newPassword);

        try {
            // Realiza una solicitud a la API para cambiar la contraseña
            const response = await axios.post(
                `${apiURL}users/change-password`,
                {
                    current_password: password,
                    new_password: newPassword,
                }
            );

            console.log(response);

            toast.success("Contraseña cambiada exitosamente.");
            setPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error) {
            toast.error(
                "Error al cambiar la contraseña: " + error.response.data.detail
            );
        }
    };

    useEffect(() => {
        userCheck(router);
        getUserData();
    }, []);

    return (
        <div className={styles.dashboard}>
            <TabBar />

            <Header role="patient" />

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
                    {/* <div className={styles["form-group"]}>
                        <label htmlFor="lastName">Grupo Sanguíneo:</label>
                        <input
                            type="text"
                            id="bloodType"
                            value={user.blood_type}
                            readOnly
                        />
                    </div> */}
                    <div className={styles["form-group"]}>
                        <label htmlFor="email">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            value={user.email}
                            readOnly
                        />
                    </div>
                </div>

                {/* Cambio de Contraseña */}
                <form
                    className={styles["form"]}
                    onSubmit={handleChangePassword}
                >
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
                            autoComplete="current-password"
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
                            autoComplete="new-password"
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
                            autoComplete="new-password"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`${styles["standard-button"]} ${
                            newPassword !== confirmNewPassword || error
                                ? styles["disabled-button"]
                                : ""
                        }`}
                        disabled={newPassword !== confirmNewPassword || error}
                    >
                        Cambiar Contraseña
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default UserProfile;

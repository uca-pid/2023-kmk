"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/styles.module.css";
import axios from "axios";
import https from "https";
import validator from "validator";
import { userCheck } from "../components/userCheck";
import { Footer, Header, PhysicianTabBar, TabBar } from "../components/header";
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
    const [schedule, setSchedule] = useState([
        { day: "Lunes", start: "08:00", end: "17:00" },
        { day: "Martes", start: "08:00", end: "17:00" },
        { day: "Miércoles", start: "08:00", end: "17:00" },
        { day: "Jueves", start: "08:00", end: "17:00" },
        { day: "Viernes", start: "08:00", end: "17:00" },
        { day: "Sábado", start: "08:00", end: "17:00" },
        { day: "Domingo", start: "08:00", end: "17:00" },
    ]);

    const handleScheduleChange = (day, value) => {
        // Actualiza el estado con los nuevos valores del rango de atención
        setSchedule((prevSchedule) =>
            prevSchedule.map((item) =>
                item.day === day
                    ? { ...item, start: value[0], end: value[1] }
                    : item
            )
        );
    };

    const handleSaveChanges = () => {
        // Realiza una solicitud para guardar los cambios en la base de datos
        // Por ejemplo, puedes usar axios para enviar los datos al servidor
        // axios.post('/api/doctor-schedule', schedule);
    };

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

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const getUserData = async () => {
        try {
            const response = await axios.get(`${apiURL}users/user-info`, {
                httpsAgent: agent,
            });

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
            <PhysicianTabBar />

            <Header role="physician" />

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
                </div>

                <div className={styles.form}>
                    {/* Modificar horario de atencion */}
                    <div className={styles["title"]}>Horario de Atención</div>

                    <div>
                        <subtitle>Modificar Horario de Atención</subtitle>
                        {schedule.map((item) => (
                            <div
                                className={styles["schedule-day-modify"]}
                                key={item.day}
                            >
                                <h3>{item.day}</h3>
                                <div
                                    className={styles["time-picker-container"]}
                                >
                                    <label>Inicio: </label>
                                    <input
                                        type="time"
                                        value={item.start}
                                        onChange={(value) =>
                                            handleScheduleChange(
                                                item.day,
                                                value
                                            )
                                        }
                                    />

                                    <label>Fin:</label>
                                    <input
                                        type="time"
                                        value={item.end}
                                        onChange={(value) =>
                                            handleScheduleChange(
                                                item.day,
                                                value
                                            )
                                        }
                                    />

                                    <button
                                        className={styles["standard-button"]}
                                        onClick={handleSaveChanges}
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </div>
                        ))}
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

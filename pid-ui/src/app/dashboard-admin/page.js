"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./dashboard-admin.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";

const Admin = () => {
    const router = useRouter();
    const [specialties, setSpecialties] = useState([]);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        const userCheck = async () => {
            console.log("Checking user profile");

            try {
                const response = await axios.get(
                    `http://localhost:8080/users/profile/`
                );

                console.log(response.data.profile);
                switch (response.data.profile) {
                    case "Admin":
                        console.log("Checking if admin");
                        router.push("/dashboard-admin");
                        break;
                    case "Physician":
                        console.log("Checking if physician");
                        router.push("/dashboard-physician");
                        break;
                    case "Patient":
                        console.log("Checking if patient");
                        router.push("/dashboard-patient");
                        break;
                    default:
                        console.log("Error");
                        break;
                }
            } catch (error) {
                console.log(error.response.data.detail);
                switch (error.response.data.detail) {
                    case "User must be logged in":
                        router.push("/");
                        break;
                    case "User has already logged in":
                        router.push("/dashboard-redirect");
                        break;
                }
            }
        };

        const fetchPhysicians = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/admins/pending-validations`
                );
                console.log(response.data.physicians_pending_validation);
                setDoctors(response.data.physicians_pending_validation);
            } catch (error) {
                console.log(error);
            }
        };

        checkUserProfile();
        fetchPhysicians();
    }, []);

    const handleApprovePhysician = async (physician) => {
        try {
            console.log(physician.id);
            const response = await axios.post(
                `http://localhost:8080/admins/approve-physician/${physician.id}`
            );
            console.log(response.data);
            alert("Profesional aprobado");
            router.push("/admin");
        } catch (error) {
            console.log(error);
        }
    };

    const handleDenyPhysician = async (physician) => {
        try {
            console.log(physician.id);
            const response = await axios.post(
                `http://localhost:8080/admins/deny-physician/${physician.id}`
            );
            console.log(response.data);
            alert("Profesional denegado");
            router.push("/admin");
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogoClick = () => {
        router.push("/dashboard-admin");
    };

    return (
        <div className={styles.admin}>
            <header className={styles.header}>
                <Image
                    src="/logo.png"
                    alt="Logo de la empresa"
                    className={styles.logo}
                    width={200}
                    height={200}
                    onClick={handleLogoClick}
                />
                <Image
                    src="/logout-icon.png"
                    alt="CerrarSesion"
                    className={styles["logout-icon"]}
                    width={200}
                    height={200}
                    onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/");
                    }}
                />
            </header>

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Profesionales pendientes de aprobación
                    </div>
                    <div className={styles["pending-approvals"]}>
                        {doctors.length > 0 ? (
                            // If there are pending doctor approvals, map through them and display each appointment
                            <div>
                                {doctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <p>
                                            Profesional:{" "}
                                            {doctor.name +
                                                " " +
                                                doctor.last_name}
                                        </p>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>
                                            Correo electrónico: {doctor.email}
                                        </p>
                                        <p>Matricula: {doctor.matricula}</p>
                                        <div
                                            className={
                                                styles[
                                                    "appointment-buttons-container"
                                                ]
                                            }
                                        >
                                            <button
                                                className={
                                                    styles["approve-button"]
                                                }
                                                onClick={() =>
                                                    handleApprovePhysician(
                                                        doctor
                                                    )
                                                }
                                            >
                                                Aprobar
                                            </button>

                                            <button
                                                className={
                                                    styles["deny-button"]
                                                }
                                                onClick={() =>
                                                    handleDenyPhysician(doctor)
                                                }
                                            >
                                                Denegar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // If there are no pending doctor approvals, display the message
                            <div className={styles["subtitle"]}>
                                No hay aprobaciones pendientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className={styles["page-footer"]}>
                <p>Derechos de autor © 2023 KMK</p>
            </footer>
        </div>
    );
};

export default Admin;

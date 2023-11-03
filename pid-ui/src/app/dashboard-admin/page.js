"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import https from "https";
import { redirect } from "../components/userCheck";
import { Header, Footer } from "../components/header";
import { toast } from "react-toastify";

const Admin = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [firstLoad, setFirstLoad] = useState(true);
    const [physicians, setPhysicians] = useState([]);
    const [pendingPhysicians, setPendingPhysicians] = useState([]);
    const [blockedPhysicians, setBlockedPhysicians] = useState([]);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchPendingPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/physicians-pending`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_pending_validation);
            setPendingPhysicians(response.data.physicians_pending_validation);
            !firstLoad ? toast.info("Profesionales actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los profesionales")
                : null;
        }
    };

    const fetchPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/physicians-working`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_pending_validation);
            setPhysicians(response.data.physicians_pending_validation);
            !firstLoad ? toast.info("Profesionales actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los profesionales")
                : null;
        }
    };

    const fetchBlockedPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/physicians-blocked`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_pending_validation);
            setBlockedPhysicians(response.data.physicians_pending_validation);
            !firstLoad ? toast.info("Profesionales actualizados") : null;
        } catch (error) {
            console.error(error);
            !firstLoad
                ? toast.error("Error al actualizar los profesionales")
                : null;
        }
    };

    const handleApprovePhysician = async (physician) => {
        try {
            console.log(physician.id);
            const response = await axios.post(
                `${apiURL}admin/approve-physician/${physician.id}`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data);
            toast.info("Profesional aprobado");
            fetchPendingPhysicians();
        } catch (error) {
            console.log(error);
        }
    };

    const handleDenyPhysician = async (physician) => {
        try {
            console.log(physician.id);
            const response = await axios.post(
                `${apiURL}admin/deny-physician/${physician.id}`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data);
            toast.info("Profesional denegado");
            fetchPendingPhysicians();
            router.refresh("/dashboard-admin");
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        redirect(router);
        fetchPhysicians();
        fetchPendingPhysicians();
        fetchBlockedPhysicians();
        setFirstLoad(false);
    }, []);

    return (
        <div className={styles.dashboard}>
            <Header />

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Profesionales pendientes de aprobación
                    </div>
                    <Image
                        src="/refresh_icon.png"
                        alt="Notificaciones"
                        className={styles["refresh-icon"]}
                        width={200}
                        height={200}
                        onClick={() => {
                            fetchPendingPhysicians();
                        }}
                    />
                    <div className={styles["pending-approvals"]}>
                        {pendingPhysicians.length > 0 ? (
                            // If there are pending doctor approvals, map through them and display each appointment
                            <div>
                                {pendingPhysicians.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <p>
                                            Profesional:{" "}
                                            {doctor.first_name +
                                                " " +
                                                doctor.last_name}
                                        </p>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>
                                            Correo electrónico: {doctor.email}
                                        </p>
                                        <p>Matricula: {doctor.tuition}</p>
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
                                                    styles["delete-button"]
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

                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Profesionales en funciones
                    </div>
                    <Image
                        src="/refresh_icon.png"
                        alt="Notificaciones"
                        className={styles["refresh-icon"]}
                        width={200}
                        height={200}
                        onClick={() => {
                            fetchPhysicians();
                        }}
                    />
                    <div className={styles["pending-approvals"]}>
                        {physicians.length > 0 ? (
                            // If there are pending doctor approvals, map through them and display each appointment
                            <div>
                                {physicians.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <p>
                                            Profesional:{" "}
                                            {doctor.first_name +
                                                " " +
                                                doctor.last_name}
                                        </p>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>
                                            Correo electrónico: {doctor.email}
                                        </p>
                                        <p>Matricula: {doctor.tuition}</p>
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
                                                    styles["delete-button"]
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

                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Profesionales bloqueados
                    </div>
                    <Image
                        src="/refresh_icon.png"
                        alt="Notificaciones"
                        className={styles["refresh-icon"]}
                        width={200}
                        height={200}
                        onClick={() => {
                            fetchBlockedPhysicians();
                        }}
                    />
                    <div className={styles["pending-approvals"]}>
                        {blockedPhysicians.length > 0 ? (
                            // If there are pending doctor approvals, map through them and display each appointment
                            <div>
                                {blockedPhysicians.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <p>
                                            Profesional:{" "}
                                            {doctor.first_name +
                                                " " +
                                                doctor.last_name}
                                        </p>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>
                                            Correo electrónico: {doctor.email}
                                        </p>
                                        <p>Matricula: {doctor.tuition}</p>
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
                                                    styles["delete-button"]
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
            <Footer />
        </div>
    );
};

export default Admin;

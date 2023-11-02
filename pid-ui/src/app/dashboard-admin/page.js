"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import https from "https";
import { userCheck } from "../components/userCheck";
import { Header, Footer } from "../components/header";
import { toast } from "react-toastify";

const Admin = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [physicians, setPhysicians] = useState([]);
    const [pendingPhysicians, setPendingPhysicians] = useState([]);
    const [blockedPhysicians, setBlockedPhysicians] = useState([]);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchPendingPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/pending-validations`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_pending_validation);
            setPendingPhysicians(response.data.physicians_pending_validation);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/pending-validations`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_pending_validation);
            setPhysicians(response.data.physicians_pending_validation);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBlockedPhysicians = async () => {
        try {
            const response = await axios.get(
                `${apiURL}admin/pending-validations`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data.physicians_pending_validation);
            setBlockedPhysicians(response.data.physicians_pending_validation);
        } catch (error) {
            console.error(error);
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

        // userCheck(router);
        fetchPhysicians();
        fetchPendingPhysicians();
        fetchBlockedPhysicians();
    }, []);

    return (
        <div className={styles.dashboard}>
            <Header />

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Profesionales pendientes de aprobación
                    </div>
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

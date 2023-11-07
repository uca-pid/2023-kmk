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
    const [specialties, setSpecialties] = useState([]);
    const [newSpecialty, setNewSpecialty] = useState("");
    const [physicians, setPhysicians] = useState([]);
    const [pendingPhysicians, setPendingPhysicians] = useState([]);
    const [blockedPhysicians, setBlockedPhysicians] = useState([]);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchSpecialties = async () => {
        try {
            const response = await axios.get(`${apiURL}specialties`, {
                httpsAgent: agent,
            });
            response.data.specialties == undefined
                ? setSpecialties([])
                : setSpecialties(response.data.specialties);
        } catch (error) {
            toast.error("Error al cargar especialidades");
            console.error(error);
        }
    };

    const handleAddSpecialty = async () => {
        try {
            const response = await axios.post(
                `${apiURL}specialties`,
                {
                    specialty: newSpecialty,
                },
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data);
            toast.info("Especialidad agregada");
            fetchSpecialties();
        } catch (error) {
            console.log(error);
            toast.error("Error al agregar especialidad");
        }
    };

    const handleSpecialtyDelete = async (specialty) => {
        try {
            const response = await axios.delete(
                `${apiURL}specialties/${specialty}`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data);
            toast.info("Especialidad borrada");
            fetchSpecialties();
        } catch (error) {
            console.log(error);
            toast.error("Error al borrar especialidad");
        }
    };

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

        // fetchBlockedPhysicians();
        // fetchPhysicians();
        fetchSpecialties();
        redirect(router);
        fetchPendingPhysicians();
        setFirstLoad(false);
    }, []);

    return (
        <div className={styles.dashboard}>
            <Header />

            <div className={styles["tab-content"]}>
                <div className={styles.form} onSubmit={handleAddSpecialty}>
                    <div className={styles["title"]}>Especialidades</div>
                    <Image
                        src="/refresh_icon.png"
                        alt="Notificaciones"
                        className={styles["refresh-icon"]}
                        width={200}
                        height={200}
                        onClick={() => {
                            fetchSpecialties();
                        }}
                    />

                    <div className={styles["subtitle"]}>
                        Agregar Especialidad
                    </div>
                    <input
                        type="text"
                        id="specialty"
                        name="specialty"
                        placeholder="Especialidad"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                    />
                    <button className={styles["add-button"]}>Agregar</button>
                    <div className={styles["admin-scrollable-section"]}>
                        {specialties.length > 0 ? (
                            <>
                                {specialties.map((specialty) => (
                                    <div
                                        key={specialty}
                                        className={
                                            styles["specialty-container"]
                                        }
                                    >
                                        <p>{specialty}</p>
                                        <div
                                            className={
                                                styles[
                                                    "appointment-buttons-container"
                                                ]
                                            }
                                        >
                                            <Image
                                                src="/trash_icon.png"
                                                alt="borrar"
                                                className={styles.logo}
                                                width={25}
                                                height={25}
                                                onClick={() => {
                                                    handleSpecialtyDelete(
                                                        specialty
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className={styles["subtitle"]}>
                                No hay aprobaciones pendientes
                            </div>
                        )}
                    </div>
                </div>

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
                    <div className={styles["admin-section"]}>
                        {pendingPhysicians.length > 0 ? (
                            <div>
                                {pendingPhysicians.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <div className={styles["subtitle"]}>
                                            {doctor.first_name +
                                                " " +
                                                doctor.last_name}
                                        </div>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>E-mail: {doctor.email}</p>
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
                    <div className={styles["admin-section"]}>
                        {physicians.length > 0 ? (
                            <div>
                                {physicians.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <div className={styles["subtitle"]}>
                                            {doctor.first_name +
                                                " " +
                                                doctor.last_name}
                                        </div>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>E-mail: {doctor.email}</p>
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
                            <div className={styles["subtitle"]}>
                                No hay profesionales en funciones
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
                    <div className={styles["admin-section"]}>
                        {blockedPhysicians.length > 0 ? (
                            // If there are pending doctor approvals, map through them and display each appointment
                            <div>
                                {blockedPhysicians.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className={styles["appointment"]}
                                    >
                                        <div className={styles["subtitle"]}>
                                            {doctor.first_name +
                                                " " +
                                                doctor.last_name}
                                        </div>
                                        <p>Especialidad: {doctor.specialty}</p>
                                        <p>E-mail: {doctor.email}</p>
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
                                No hay profesionales bloqueados
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

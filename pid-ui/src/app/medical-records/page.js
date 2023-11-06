"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import axios from "axios";
import https from "https";
import { Footer, Header, PhysicianTabBar } from "../components/header";
import { toast } from "react-toastify";
import Image from "next/image";

const MedicalRecords = ({ searchParams }) => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [urlSearchParams, setUrlSearchParams] = useState(null);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    useEffect(() => {
        if (window)
            setUrlSearchParams(new URLSearchParams(window.location.search));
    }, []);

    const [patientId, setPatientId] = useState(
        searchParams.patientId || urlSearchParams.get("patientId")
    );
    const [record, setRecord] = useState({
        name: "",
        last_name: "",
        birth_date: "",
        gender: "",
        blood_type: "",
        id: "",
        observations: [],
    });
    const [analysis, setAnalysis] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `${apiURL}records/get-record/${patientId}`,
                {
                    httpsAgent: agent,
                }
            );
            setRecord(response.data.record);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyAnalysis = async () => {
        try {
            const response = await axios.get(`${apiURL}analysis/${patientId}`);
            setAnalysis(response.data);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        if (patientId) {
            axios.defaults.headers.common = {
                Authorization: `bearer ${localStorage.getItem("token")}`,
            };
            fetchData();
            fetchMyAnalysis();
        }
    }, [patientId]);

    return (
        <div className={styles.dashboard}>
            <PhysicianTabBar />

            <Header role="physician" />
            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Paciente: {record.name} {record.last_name}
                    </div>
                    <Image
                        src="/refresh_icon.png"
                        alt="Refrescar"
                        className={styles["refresh-icon"]}
                        width={200}
                        height={200}
                        onClick={() => {
                            fetchData();
                            fetchMyAnalysis();
                            toast.info("Datos actualizados");
                        }}
                    />
                    <div className={styles["subtitle"]}>
                        Fecha de nacimiento: {record.birth_date}
                    </div>
                    <div className={styles["subtitle"]}>
                        Genero: {record.gender}
                    </div>
                    <div className={styles["subtitle"]}>
                        Grupo sanguíneo: {record.blood_type}
                    </div>

                    <div className={styles["my-estudios-section"]}>
                        <div className={styles["title"]}>
                            Estudios del paciente
                        </div>
                        <div className={styles["horizontal-scroll"]}>
                            {Array.isArray(analysis) ? (
                                analysis.map((uploaded_analysis) => {
                                    return (
                                        <div key={uploaded_analysis.id}>
                                            <a
                                                className={
                                                    styles["estudio-card"]
                                                }
                                                href={uploaded_analysis.url}
                                                target="_blank"
                                            >
                                                <div
                                                    className={
                                                        styles["estudio-name"]
                                                    }
                                                >
                                                    {uploaded_analysis.file_name.substring(
                                                        0,
                                                        12
                                                    ) + "..."}
                                                </div>
                                                <Image
                                                    src="/document.png"
                                                    alt=""
                                                    className={
                                                        styles["document-icon"]
                                                    }
                                                    width={100}
                                                    height={100}
                                                    onClick={() => {}}
                                                />
                                                <div
                                                    className={
                                                        styles["estudio-date"]
                                                    }
                                                >
                                                    {new Date(
                                                        uploaded_analysis.uploaded_at *
                                                            1000
                                                    ).toLocaleString("es-AR")}
                                                </div>
                                            </a>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles["subtitle"]}>
                                    No hay analisis cargados
                                </div>
                            )}
                        </div>
                    </div>

                    {/* <form
                        className={styles["new-record-section"]}
                        onSubmit={handleAddObservation}
                    >
                        <div className={styles["title"]}>Nueva observación</div>

                        <label htmlFor="observation-date">
                            Fecha de la Observacion
                        </label>
                        <input
                            type="date"
                            id="observation-date"
                            value={newObservationDate}
                            onChange={(e) =>
                                setNewObservationDate(e.target.value)
                            }
                            required
                        />
                        <label htmlFor="observation">Observacion</label>

                        <input
                            type="text"
                            id="observation"
                            value={newObservationContent}
                            onChange={(e) =>
                                setNewObservationContent(e.target.value)
                            }
                            placeholder="Escribe una nueva observación"
                            required
                        />
                        <button
                            className={`${styles["submit-button"]} ${
                                !newObservationContent || !newObservationDate
                                    ? styles["disabled-button"]
                                    : ""
                            }`}
                            type="submit"
                            disabled={
                                !newObservationContent || !newObservationDate
                            }
                        >
                            Agregar
                        </button>
                    </form> */}

                    <div className={styles["records-section"]}>
                        {record.observations.length > 0 ? (
                            // If there are appointments, map through them and display each appointment
                            <>
                                {record.observations.map(
                                    (observation, index) => {
                                        return (
                                            <div
                                                className={
                                                    styles["record-card"]
                                                }
                                                key={index}
                                            >
                                                <div
                                                    className={
                                                        styles["record-date"]
                                                    }
                                                >
                                                    {observation.date}
                                                </div>
                                                <div
                                                    className={
                                                        styles[
                                                            "record-observations"
                                                        ]
                                                    }
                                                >
                                                    {observation.observation}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </>
                        ) : (
                            // If there are no appointments, display the message
                            <div className={styles["subtitle"]}>
                                No hay observaciones en esta historia clinica
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MedicalRecords;

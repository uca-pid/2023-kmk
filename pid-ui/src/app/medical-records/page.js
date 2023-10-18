"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/styles.module.css";
import axios from "axios";
import { Footer, Header } from "../components/header";

const MedicalRecords = ({ searchParams }) => {
    const [urlSearchParams, setUrlSearchParams] = useState(null);

    useEffect(() => {
        console.log(window.location.search, "jijijijiijij");
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
    const [newObservationDate, setNewObservationDate] = useState("");
    const [newObservationContent, setNewObservationContent] = useState("");

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/records/get-record/${patientId}`
            );
            setRecord(response.data.record);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    // const handleAddObservation = async (e) => {
    //     console.log(patientId, "handleAddObservation");
    //     console.log(newObservationDate, newObservationContent);
    //     e.preventDefault();
    //     try {
    //         const response = await axios.post(
    //             `http://localhost:8080/records/update/${patientId}`,
    //             {
    //                 date: newObservationDate,
    //                 observation: newObservationContent,
    //             }
    //         );
    //         console.log(response);
    //         fetchData();
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    useEffect(() => {
        if (patientId) {
            axios.defaults.headers.common = {
                Authorization: `bearer ${localStorage.getItem("token")}`,
            };
            fetchData();
        }
    }, [patientId]);

    return (
        <div className={styles.dashboard}>
            <Header />
            {/* <div className={styles["title"]}>Patient ID: {patient_id}</div> */}
            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Paciente: {record.name} {record.last_name}
                    </div>
                    <div className={styles["subtitle"]}>
                        Fecha de nacimiento: {record.birth_date}
                    </div>
                    <div className={styles["subtitle"]}>
                        Genero: {record.gender}
                    </div>
                    <div className={styles["subtitle"]}>
                        Grupo sanguíneo: {record.blood_type}
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

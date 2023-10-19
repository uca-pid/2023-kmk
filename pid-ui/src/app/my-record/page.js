"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/styles.module.css";
import axios from "axios";
import { Footer, Header } from "../components/header";

const MedicalRecords = () => {
    const [record, setRecord] = useState({
        name: "",
        last_name: "",
        birth_date: "",
        gender: "",
        blood_type: "",
        id: "",
        observations: [],
    });

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/records/get-my-record`
            );
            setRecord(response.data.record);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        fetchData();
    }, []);

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

"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import axios from "axios";
import https from "https";
import { Footer, Header, TabBar } from "../components/header";
import Image from "next/image";
import { toast } from "react-toastify";

const MyRecord = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [file, setFile] = useState([]); // File to be uploaded
    const [record, setRecord] = useState({
        name: "",
        last_name: "",
        birth_date: "",
        gender: "",
        blood_type: "",
        id: "",
        observations: [],
    });

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });
    const [analysis, setAnalysis] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${apiURL}records/get-my-record`, {
                httpsAgent: agent,
            });
            setRecord(response.data.record);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyAnalysis = async () => {
        try {
            const response = await axios.get(`${apiURL}analysis`);
            setAnalysis(response.data);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        toast.info("Subiendo analisis");
        const formData = new FormData();
        Array.from(file).forEach((file_to_upload) =>
            formData.append("analysis", file_to_upload)
        );
        try {
            const response = await axios.post(`${apiURL}analysis`, formData);
            console.log(response);
            toast.success("Analisis subido con exito");
            fetchMyAnalysis();
        } catch (error) {
            console.error(error);
            toast.error("Error al subir analisis");
        }
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        fetchData();
        fetchMyAnalysis();
    }, []);

    return (
        <div className={styles.dashboard}>
            <TabBar highlight="Ficha" />

            <Header role="patient" />

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        {record.name} {record.last_name}
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
                        Nac.: {record.birth_date}
                    </div>
                    <div className={styles["subtitle"]}>
                        Genero: {record.gender}
                    </div>
                    <div className={styles["subtitle"]}>
                        Grupo sanguíneo: {record.blood_type}
                    </div>

                    <div className={styles["my-estudios-section"]}>
                        <div className={styles["title"]}>Mis Estudios</div>

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

                        <form
                            className={styles["file-upload-form"]}
                            onSubmit={onSubmit}
                        >
                            <input
                                type="file"
                                name="file"
                                accept=".pdf"
                                multiple={true}
                                onChange={(e) => setFile(e.target.files)}
                            />
                            <button
                                className={styles["edit-button"]}
                                type="submit"
                                value="Upload"
                            >
                                Cargar analisis
                            </button>
                        </form>
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
                                                    Observacion del{" "}
                                                    {observation.date.toLocaleString()}
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

export default MyRecord;

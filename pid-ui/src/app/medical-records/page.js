"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/styles.module.css";
import axios from "axios";
import { Footer, Header } from "../components/header";

const MedicalRecords = () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const patientId = urlSearchParams.get("patientId");
    const [patient, setPatient] = useState({});

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/medical-record/${patientId}`
            );
            setPatient(response.data);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={styles.dashboard}>
            <Header />

            <div className={styles["title"]}>Patient ID: {patientId}</div>

            <Footer />
        </div>
    );
};

export default MedicalRecords;

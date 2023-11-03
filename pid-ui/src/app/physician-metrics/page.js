"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import https from "https";
import { redirect } from "../components/userCheck";
import { Header, Footer, PhysicianTabBar } from "../components/header";
import { toast } from "react-toastify";

const PhysicianPendingAppointments = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        // userCheck(router);
    }, []);

    return (
        <div className={styles.dashboard}>
            <PhysicianTabBar highlight={"Metricas"} />

            <Header role="physician" />

            <div className={styles["tab-content"]}>
                <Image
                    src="/dogo.png"
                    alt=""
                    className={styles["dogo-icon"]}
                    width={500}
                    height={500}
                    onClick={() => {}}
                />
            </div>

            <Footer />
        </div>
    );
};

export default PhysicianPendingAppointments;

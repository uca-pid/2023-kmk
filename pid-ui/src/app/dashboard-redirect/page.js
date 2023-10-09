"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./dashboard-redirect.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";

const Redirect = () => {
    const router = useRouter();

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        const userCheck = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/users/role/`
                );

                if (response.status == 200) {
                    if (response.data.roles.includes("admin")) {
                        router.replace("/dashboard-admin");
                    } else if (response.data.roles.includes("physician")) {
                        router.replace("/dashboard-physician");
                    } else if (response.data.roles.includes("patient")) {
                        router.replace("/dashboard-patient");
                    } else {
                        router.replace("/");
                    }
                } else {
                    console.log("Error");
                    router.replace("/");
                }
            } catch (error) {
                // console.error(error.response.data.detail);
                switch (error.response.data.detail) {
                    case "User must be logged in":
                        router.replace("/");
                        break;
                    case "User has already logged in":
                        router.replace("/dashboard-redirect");
                        break;
                }
            }
        };
        userCheck();
    }, []);

    return (
        <div className={styles.admin}>
            <header className={styles.header}>
                <Image
                    src='/logo.png'
                    alt='Logo de la empresa'
                    className={styles.logo}
                    width={200}
                    height={200}
                />
                <Image
                    src='/logout-icon.png'
                    alt='CerrarSesion'
                    className={styles["logout-icon"]}
                    width={200}
                    height={200}
                    onClick={() => {
                        localStorage.removeItem("token");
                        router.replace("/");
                    }}
                />
            </header>

            <div className={styles["tab-content"]}></div>

            <footer className={styles["page-footer"]}>
                <p>Derechos de autor © 2023 KMK</p>
            </footer>
        </div>
    );
};

export default Redirect;

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./dashboard-redirect.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";

const Admin = () => {
    const router = useRouter();

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        let token = localStorage.getItem("token");

        const checkUserIsAdmin = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/users/profile/`,
                    token
                );
                console.log(response.data);
                if (response.data.user.role != "admin") {
                    alert("No tiene permisos para acceder a esta página");
                    router.push("/");
                }
            } catch (error) {
                console.log(error);
            }
        };
        checkUserIsAdmin();
    }, []);

    return (
        <div className={styles.admin}>
            <header className={styles.header}>
                <Image
                    src="/logo.png"
                    alt="Logo de la empresa"
                    className={styles.logo}
                    width={200}
                    height={200}
                />
                <Image
                    src="/logout-icon.png"
                    alt="CerrarSesion"
                    className={styles["logout-icon"]}
                    width={200}
                    height={200}
                    onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/");
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

export default Admin;

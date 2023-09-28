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
            console.log("Checking user profile");

            try {
                const response = await axios.get(
                    `http://localhost:8080/users/profile/`
                );

                console.log(response.data);
                switch (response.data.profile) {
                    case "Admin":
                        console.log("Checking if admin");
                        router.push("/dashboard-admin");
                        break;
                    case "Physician":
                        if (
                            response.data.approved == "denied" ||
                            response.data.approved == "pending"
                        ) {
                            alert("Medico no validado");
                            router.push("/");
                            break;
                        }
                        console.log("Checking if physician");
                        router.push("/dashboard-physician");
                        break;
                    case "Patient":
                        console.log("Checking if patient");
                        router.push("/dashboard-patient");
                        break;
                    default:
                        console.log("Error");
                        break;
                }
            } catch (error) {
                console.log(error.response.data.detail);
                switch (error.response.data.detail) {
                    case "User must be logged in":
                        router.push("/");
                        break;
                    case "User has already logged in":
                        router.push("/dashboard-redirect");
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

export default Redirect;

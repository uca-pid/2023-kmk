import React from "react";
import Image from "next/image";
import styles from "../styles/Header.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";

const Header = () => {
    const router = useRouter();
    const handleLogoClick = () => {
        router.push("/dashboard-redirect");
    };

    return (
        <div className={styles.header}>
            <Image
                src="/logo.png"
                alt="Logo de la empresa"
                className={styles.logo}
                width={200}
                height={200}
                onClick={handleLogoClick}
            />
            <Image
                src="/logout-icon.png"
                alt="CerrarSesion"
                className={styles["logout-icon"]}
                width={200}
                height={200}
                onClick={() => {
                    localStorage.removeItem("token");
                    axios.defaults.headers.common = {
                        Authorization: `bearer`,
                    };
                    router.push("/");
                }}
            />
            <Image
                src="/user-icon.png"
                alt="CerrarSesion"
                className={styles["user-icon"]}
                width={200}
                height={200}
                onClick={() => {
                    localStorage.removeItem("token");
                    axios.defaults.headers.common = {
                        Authorization: `bearer`,
                    };
                    router.push("/");
                }}
            />
        </div>
    );
};

const TabBar = () => {
    const router = useRouter();
    const handleLogoClick = () => {
        router.push("/dashboard-redirect");
    };

    return (
        <div className={styles["tab-bar"]}>
            <div className={styles.tab} onClick={handleLogoClick}>
                Turnos
            </div>
            <div className={styles.tab_disabled}>Mi Ficha</div>
        </div>
    );
};

const Footer = () => {
    return (
        <footer className={styles["page-footer"]}>
            <p>Derechos de autor © 2023 KMK</p>
        </footer>
    );
};

export { Header, TabBar, Footer };
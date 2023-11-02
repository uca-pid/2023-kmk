import React from "react";
import Image from "next/image";
import styles from "../styles/Header.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import loginCheck from "../components/userCheck";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = () => {
    const router = useRouter();

    return (
        <div className={styles.header}>
            <ToastContainer
                limit={3}
                position={"top-right"}
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick={true}
                pauseOnHover={true}
            />
            <Image
                src="/logo.png"
                alt="Logo de la empresa"
                className={styles.logo}
                width={200}
                height={200}
                onClick={() => {
                    loginCheck(router);
                }}
                priority={true}
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
            {/* <Image
                src="/bell_icon.png"
                alt="Notificaciones"
                className={styles["bell-icon"]}
                width={200}
                height={200}
                onClick={() => {}}
            /> */}
            <Image
                src="/user-icon.png"
                alt="Usuario"
                className={styles["user-icon"]}
                width={200}
                height={200}
                onClick={() => {
                    router.push("/user");
                }}
            />
        </div>
    );
};

const HeaderSlim = () => {
    const router = useRouter();

    return (
        <div className={styles.header}>
            <ToastContainer
                limit={1}
                position={"top-right"}
                hideProgressBar={false}
                closeOnClick={true}
                pauseOnHover={true}
            />
            <Image
                src="/logo.png"
                alt="Logo de la empresa"
                className={styles.logo}
                width={200}
                height={200}
            />
        </div>
    );
};

const TabBar = (props) => {
    const router = useRouter();
    const handleLogoClick = () => {
        loginCheck(router);
    };

    return (
        <div className={styles["tab-bar"]}>
            <div
                className={`${styles["tab"]} ${
                    props.highlight === "Turnos" ? styles["selected-tab"] : ""
                }`}
                onClick={handleLogoClick}
            >
                Turnos
            </div>
            <div
                className={`${styles["tab"]} ${
                    props.highlight === "Ficha" ? styles["selected-tab"] : ""
                }`}
                onClick={() => router.push("/my-record")}
            >
                Mi Ficha
            </div>
        </div>
    );
};

const PhysicianTabBar = (props) => {
    const router = useRouter();
    return (
        <div className={styles["tab-bar"]}>
            <div
                className={`${styles["tab"]} ${
                    props.highlight === "TurnosDelDia"
                        ? styles["selected-tab"]
                        : ""
                }`}
                onClick={() => router.push("/physician-agenda")}
            >
                Turnos del día
            </div>
            <div
                className={`${styles["tab"]} ${
                    props.highlight === "TurnosPorAprobar"
                        ? styles["selected-tab"]
                        : ""
                }`}
                onClick={() => router.push("/physician-peding-appointments")}
            >
                Turnos por aprobar
            </div>
            <div
                className={`${styles["tab"]} ${
                    props.highlight === "Metricas" ? styles["selected-tab"] : ""
                }`}
                onClick={() => router.push("/physician-metrics")}
            >
                Mis metricas
            </div>
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

export { Header, HeaderSlim, TabBar, PhysicianTabBar, Footer };

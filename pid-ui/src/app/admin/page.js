"use client";

import React, { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { useRouter } from "next/navigation";
import withAuth from "./withAuth";

const Admin = () => {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState(new Date());
  const [doctors, setDoctors] = useState([]);

  const handleLogoClick = () => {
    router.push("/admin");
  };

  return (
    <div className={styles.admin}>
      <header className={styles.header} onClick={handleLogoClick}>
        <img src="/logo.png" alt="Logo de la empresa" className={styles.logo} />
      </header>

      <div className={styles["tab-content"]}>
        <div className={styles.form}>
          <div className={styles["title"]}>
            Profesionales pendientes de aprobación
          </div>
          <div className={styles["pending-approvals"]}>
            {doctors.length > 0 ? (
              // If there are pending doctor approvals, map through them and display each appointment
              <div>
                {doctors.map((doctor) => (
                  <div key={doctor.id} className={styles["appointment"]}>
                    <p>Profesional: {doctor.name}</p>
                    <div
                      className={styles["appointment-buttons-container"]}
                    ></div>
                  </div>
                ))}
              </div>
            ) : (
              // If there are no pending doctor approvals, display the message
              <div className={styles["subtitle"]}>
                No hay aprobaciones pendientes
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className={styles["page-footer"]}>
        <p>Derechos de autor © 2023 KMK</p>
      </footer>
    </div>
  );
};

export default withAuth(Admin);

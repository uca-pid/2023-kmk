"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Header, Footer, PhysicianTabBar } from "../components/header";
import { redirect } from "../components/userCheck";
import { toast } from "react-toastify";

const PhysicianAgenda = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [isAddObservationModalOpen, setIsAddObervationModalOpen] =
        useState(false);
    const [patientId, setPatientId] = useState("");
    const [newObservationDate, setNewObservationDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [newObservationContent, setNewObservationContent] = useState("");
    const [appointmentAttended, setAppointmentAttended] = useState("yes");

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });
    const [observationPayload, setObservationPayload] = useState("");

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${apiURL}appointments`, {
                httpsAgent: agent,
            });
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            console.log(error);
        }
    };

    const handleOpenObservationModal = (appointment) => {
        console.log(appointment);
        setIsAddObervationModalOpen(true);
        setObservationPayload(appointment);
        setPatientId(appointment.patient.id);
        setNewObservationDate(appointment.date.toLocaleString("es-AR"));
    };

    const handleAddObservation = async (e) => {
        console.log(patientId, "handleAddObservation");
        console.log(newObservationDate, newObservationContent);
        e.preventDefault();
        console.log(observationPayload.id);
        try {
            const response = await axios.post(
                `${apiURL}records/update`,
                {
                    appointment_id: observationPayload.id,
                },
                {
                    httpsAgent: agent,
                }
            );
            console.log(response);
            toast.info("Observación agregada exitosamente");
            handleCloseEditModal();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        console.log(appointmentId);
        try {
            await axios.delete(`${apiURL}appointments/${appointmentId}`, {
                httpsAgent: agent,
            });
            toast.info("Turno eliminado exitosamente");
            fetchAppointments();
        } catch (error) {
            console.log(error);
        }
    };

    const customStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
        },
    };

    const handleCloseEditModal = () => {
        setIsAddObervationModalOpen(false);
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        redirect(router);
        fetchAppointments();
    }, []);

    return (
        <div className={styles.dashboard}>
            {isAddObservationModalOpen && (
                <Modal
                    ariaHideApp={false}
                    isOpen={isAddObservationModalOpen}
                    onRequestClose={handleCloseEditModal}
                    style={customStyles}
                >
                    <form
                        className={styles["new-record-section"]}
                        onSubmit={handleAddObservation}
                    >
                        <div className={styles["title"]}>Gestion del Turno</div>
                        <div className={styles["appointment"]}>
                            <div className={styles["subtitle"]}>
                                El paciente fue atendido?
                            </div>
                            <select
                                className={styles["select"]}
                                name="attended"
                                id="attended"
                                onChange={(e) => setAppointmentAttended(e)}
                            >
                                <option value="yes">Si</option>
                                <option value="no">No</option>
                            </select>

                            <div className={styles["subtitle"]}>
                                Horario real de atencion:{" "}
                            </div>

                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                            />

                            <div className={styles["subtitle"]}>
                                Observaciones{" "}
                            </div>

                            <input
                                type="text"
                                id="observation"
                                value={newObservationContent}
                                onChange={(e) =>
                                    setNewObservationContent(e.target.value)
                                }
                                placeholder="Escribe una nueva observación"
                                required
                                className={styles.observationInput}
                            />
                        </div>

                        <button
                            className={`${styles["submit-button"]} ${
                                !newObservationContent || !newObservationDate
                                    ? styles["disabled-button"]
                                    : ""
                            }`}
                            type="submit"
                            disabled={
                                !newObservationContent || !newObservationDate
                            }
                        >
                            Agregar
                        </button>
                    </form>
                </Modal>
            )}

            <PhysicianTabBar highlight={"TurnosDelDia"} />

            <Header role="physician" />

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>Mis Proximos Turnos</div>
                    <Image
                        src="/refresh_icon.png"
                        alt="Notificaciones"
                        className={styles["refresh-icon"]}
                        width={200}
                        height={200}
                        onClick={() => {
                            fetchAppointments();
                            toast.info("Turnos actualizados");
                        }}
                    />
                    <div className={styles["appointments-section"]}>
                        {appointments.length > 0 ? (
                            // If there are appointments, map through them and display each appointment
                            <div>
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={styles["appointment"]}
                                    >
                                        <div className={styles["subtitle"]}>
                                            Paciente:{" "}
                                            {appointment.patient.first_name +
                                                " " +
                                                appointment.patient.last_name}
                                        </div>
                                        <p>
                                            Fecha y hora:{" "}
                                            {new Date(
                                                appointment.date * 1000
                                            ).toLocaleString("es-AR")}
                                        </p>
                                        <div
                                            className={
                                                styles[
                                                    "appointment-buttons-container"
                                                ]
                                            }
                                        >
                                            <button
                                                className={
                                                    styles["standard-button"]
                                                }
                                                onClick={() => {
                                                    handleOpenObservationModal(
                                                        appointment
                                                    );
                                                }}
                                            >
                                                Agregar Observacion{" "}
                                            </button>
                                            <Link
                                                href={{
                                                    pathname:
                                                        "/medical-records?patientId",
                                                    query: appointment.patient
                                                        .id,
                                                }}
                                                as={`medical-records?patientId=${appointment.patient.id}`}
                                            >
                                                <button
                                                    className={
                                                        styles[
                                                            "standard-button"
                                                        ]
                                                    }
                                                >
                                                    Ver Historia Clinica
                                                </button>
                                            </Link>

                                            <button
                                                className={
                                                    styles["delete-button"]
                                                }
                                                onClick={() =>
                                                    handleDeleteAppointment(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // If there are no appointments, display the message
                            <div className={styles["subtitle"]}>
                                No hay turnos pendientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PhysicianAgenda;

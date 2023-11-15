"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Header, Footer, PhysicianTabBar } from "../components/header";
import { redirect } from "../components/userCheck";
import { toast } from "react-toastify";

const PhysicianAgenda = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [isAddObservationModalOpen, setIsAddObervationModalOpen] =
        useState(false);
    const [patientId, setPatientId] = useState("");
    const [newObservationDate, setNewObservationDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [newObservationContent, setNewObservationContent] = useState("");
    const [appointmentAttended, setAppointmentAttended] = useState(true);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });
    const [appointmentToClose, setAppointmentToClose] = useState("");

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(
                `${apiURL}appointments/physician`,
                {
                    httpsAgent: agent,
                }
            );
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            toast.error("Error al obtener los turnos");
            console.log(error);
        }
    };

    const handleOpenAppointmentClosureModal = (appointment) => {
        console.log(appointment);
        setIsAddObervationModalOpen(true);
        setAppointmentToClose(appointment);
        setPatientId(appointment.patient.id);
        setNewObservationDate(appointment.date.toLocaleString("es-AR"));
    };

    const handleAppointmentClosure = async () => {
        try {
            const response = await axios.post(
                `${apiURL}appointments/close-appointment/${appointmentToClose.id}`,
                {
                    attended: appointmentAttended,
                    start_time: newObservationDate,
                },
                {
                    httpsAgent: agent,
                }
            );
        } catch (error) {
            toast.error("Error al cerrar el turno");
            console.error(error);
        }

        try {
            const response = await axios.post(
                `${apiURL}records/update/${patientId}`,
                {
                    observation: newObservationContent,
                },
                {
                    httpsAgent: agent,
                }
            );
            toast.info("Turno cerrado exitosamente");
            fetchAppointments();
            setIsAddObervationModalOpen(false);
        } catch (error) {
            toast.error("Error al agregar la observación");
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
            toast.error("Error al eliminar el turno");
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
        fetchAppointments()
            .then(() => setIsLoading(false)) // Marcar como cargado cuando la respuesta llega
            .catch(() => {
                setIsLoading(false); // Asegúrate de marcar como cargado en caso de error
            });
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
                        onSubmit={handleAppointmentClosure}
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
                                <option value={true}>Si</option>
                                <option value={false}>No</option>
                            </select>

                            <div className={styles["subtitle"]}>
                                Horario real de atencion:{" "}
                            </div>

                            <input
                                type="time"
                                id="time"
                                name="time"
                                onChange={(date) => setStartTime(date)}
                            />

                            <div className={styles["subtitle"]}>
                                Observaciones
                            </div>

                            <textarea
                                id="observation"
                                value={newObservationContent}
                                onChange={(e) =>
                                    setNewObservationContent(e.target.value)
                                }
                                placeholder="Escribe una nueva observación"
                                required
                                className={styles.observationInput}
                                wrap="soft"
                                disabled={appointmentAttended == "no"}
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

            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <div className={styles["tab-content"]}>
                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Mis Proximos Turnos
                            </div>
                            <Image
                                src="/refresh_icon.png"
                                alt="Notificaciones"
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando...");
                                    fetchAppointments();
                                }}
                            />
                            <div className={styles["appointments-section"]}>
                                {appointments.length > 0 ? (
                                    // If there are appointments, map through them and display each appointment
                                    <div>
                                        {appointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    Paciente:{" "}
                                                    {appointment.patient
                                                        .first_name +
                                                        " " +
                                                        appointment.patient
                                                            .last_name}
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
                                                            styles[
                                                                "standard-button"
                                                            ]
                                                        }
                                                        onClick={() => {
                                                            handleOpenAppointmentClosureModal(
                                                                appointment
                                                            );
                                                        }}
                                                    >
                                                        Finalizar Turno
                                                    </button>
                                                    <Link
                                                        href={{
                                                            pathname:
                                                                "/medical-records?patientId",
                                                            query: appointment
                                                                .patient.id,
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
                                                            styles[
                                                                "delete-button"
                                                            ]
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
                </>
            )}
        </div>
    );
};

export default PhysicianAgenda;

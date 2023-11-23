"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Header, Footer, PhysicianTabBar } from "../components/header";
import ConfirmationModal from "../components/ConfirmationModal";
import { redirect } from "../components/userCheck";
import { toast } from "react-toastify";

const PhysicianAgenda = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [appointments, setAppointments] = useState([]);
    const [isAddObservationModalOpen, setIsAddObervationModalOpen] =
        useState(false);
    const [patientId, setPatientId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [newObservationContent, setNewObservationContent] = useState("");
    const [appointmentAttended, setAppointmentAttended] = useState(true);
    const [appointmentToClose, setAppointmentToClose] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);

    const [reviews, setReviews] = useState([
        { id: 1, type: "Puntualidad", rating: 5 },
        { id: 2, type: "Comunicacion", rating: 4.5 },
        { id: 3, type: "Asistencia", rating: 4.5 },
        { id: 4, type: "Trato", rating: 3 },
        { id: 5, type: "Limpieza", rating: 4.5 },
    ]);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const getScores = async (id) => {
        try {
            const response = await axios.get(`${apiURL}users/score/${id}`, {
                httpsAgent: agent,
            });
            console.log(response.data.score_metrics);

            let tempReviews = [
                { id: 1, type: "Puntualidad", rating: 5 },
                { id: 2, type: "Comunicacion", rating: 4.5 },
                { id: 3, type: "Asistencia", rating: 4.5 },
                { id: 4, type: "Trato", rating: 3 },
                { id: 5, type: "Limpieza", rating: 4.5 },
            ];

            tempReviews[0].rating = response.data.score_metrics.puntuality;
            tempReviews[1].rating = response.data.score_metrics.communication;
            tempReviews[2].rating = response.data.score_metrics.attendance;
            tempReviews[3].rating = response.data.score_metrics.treat;
            tempReviews[4].rating = response.data.score_metrics.cleanliness;

            setReviews(tempReviews);
        } catch (error) {
            toast.error("Error al obtener los puntajes");
            console.error(error);
        }
    };

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
            console.error(error);
        }
    };

    const handleOpenAppointmentClosureModal = (appointment) => {
        getScores(appointment.patient.id);
        setIsAddObervationModalOpen(true);
        setAppointmentToClose(appointment);
        setPatientId(appointment.patient.id);
    };

    const handleAppointmentClosure = async () => {
        console.log(appointmentToClose.id);
        console.log(appointmentAttended);
        console.log(startTime);
        let hour = startTime.split(":")[0];
        let minutes = startTime.split(":")[1];
        let date = new Date(appointmentToClose.date * 1000);
        date.setHours(hour);
        date.setMinutes(minutes);
        console.log((date.getTime() / 1000).toString());

        try {
            const response = await axios.put(
                `${apiURL}appointments/close-appointment/${appointmentToClose.id}`,
                {
                    attended: appointmentAttended,
                    start_time: (date.getTime() / 1000).toString(),
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
                `${apiURL}records/update`,
                {
                    appointment_id: appointmentToClose.id,
                    attended: appointmentAttended.toString(),
                    real_start_time: (date.getTime() / 1000).toString(),
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

        try {
            const response = await axios.post(
                `${apiURL}users/add-score`,
                {
                    appointment_id: appointmentToClose.id,
                    puntuality: reviews[0].rating,
                    communication: reviews[1].rating,
                    attendance: reviews[2].rating,
                    treat: reviews[3].rating,
                    cleanliness: reviews[4].rating,
                },
                {
                    httpsAgent: agent,
                }
            );
            toast.info("Puntaje cargado exitosamente");
        } catch (error) {
            toast.error("Error al agregar la puntaje");
            console.error(error);
        }
    };

    const handleDeleteClick = (appointmentId) => {
        setAppointmentIdToDelete(appointmentId);
        setShowModal(true);
    };

    const handleDeleteAppointment = async () => {
        setShowModal(false);
        toast.info("Eliminando turno...");
        try {
            await axios.delete(
                `${apiURL}appointments/${appointmentIdToDelete}`,
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Turno eliminado exitosamente");
            fetchAppointments();
            setAppointmentIdToDelete(null); // Limpiar el ID del turno después de eliminar
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar turno");
        }
    };

    const MODAL_STYLES = {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        width: "80%",
        marginTop: "6rem",
    };

    const OVERLAY_STYLE = {
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0, .8)",
        zIndex: "1000",
        overflowY: "auto",
        marginTop: "6rem",
    };

    const handleCloseEditModal = () => {
        setIsAddObervationModalOpen(false);
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
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
                    // style={customStyles}
                >
                    <div
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
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setAppointmentAttended(e.target.value);
                                }}
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
                                onChange={(date) => {
                                    setStartTime(date.target.value.toString());
                                    console.log(date.target.value.toString());
                                }}
                                disabled={appointmentAttended == "false"}
                                required
                                className={`${
                                    appointmentAttended == "false"
                                        ? styles["disabled-input"]
                                        : ""
                                }`}
                            />

                            <div className={styles["subtitle"]}>
                                Observaciones
                            </div>

                            <textarea
                                id="observation"
                                value={newObservationContent}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setNewObservationContent(e.target.value);
                                }}
                                placeholder="Escribe una nueva observación"
                                required
                                className={`${styles["observation-input"]} ${
                                    appointmentAttended === "false"
                                        ? styles["disabled-input"]
                                        : ""
                                }`}
                                wrap="soft"
                                disabled={appointmentAttended == "false"}
                            />
                        </div>

                        <div
                            key={reviews.key}
                            className={styles["reviews-container"]}
                        >
                            {reviews.length > 0 ? (
                                <>
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className={styles["review"]}
                                        >
                                            <div
                                                className={
                                                    styles[
                                                        "review-cards-container"
                                                    ]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["review-card"]
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                "review-card-title"
                                                            ]
                                                        }
                                                    >
                                                        {review.type}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                "review-card-content"
                                                            ]
                                                        }
                                                    >
                                                        <input
                                                            type="number"
                                                            id="points"
                                                            name="points"
                                                            min="0"
                                                            max="5"
                                                            placeholder={
                                                                review.rating
                                                            }
                                                            onChange={(e) => {
                                                                setReviews(
                                                                    reviews.map(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item.id ===
                                                                            review.id
                                                                                ? {
                                                                                      ...item,
                                                                                      rating: e
                                                                                          .target
                                                                                          .value,
                                                                                  }
                                                                                : item
                                                                    )
                                                                );
                                                            }}
                                                        ></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                // If there are no reviews, display the message
                                <div className={styles["subtitle"]}>
                                    No hay reviews
                                </div>
                            )}
                        </div>

                        <button
                            className={`${styles["edit-button"]} ${
                                !newObservationContent || !startTime
                                    ? styles["disabled-button"]
                                    : ""
                            }`}
                            onClick={handleAppointmentClosure}
                            disabled={!newObservationContent || !startTime}
                        >
                            Agregar
                        </button>
                    </div>
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
                                alt="Refrescar"
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
                                        {/* ... */}
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
                                                    Fecha y hora:
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
                                                            handleDeleteClick(
                                                                appointment.id
                                                            )
                                                        }
                                                    >
                                                        Cancelar
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
                                {/* ... */}
                            </div>
                            {/* Modal de confirmación */}
                            <ConfirmationModal
                                isOpen={showModal}
                                closeModal={() => setShowModal(false)}
                                confirmAction={handleDeleteAppointment}
                                message="¿Estás seguro de que deseas cancelar este turno?"
                            />
                        </div>
                    </div>

                    <Footer />
                </>
            )}
        </div>
    );
};

export default PhysicianAgenda;

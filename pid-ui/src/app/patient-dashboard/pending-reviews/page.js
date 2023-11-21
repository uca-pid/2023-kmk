"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Footer, Header, TabBar } from "../../components/header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { add } from "date-fns";

const DashboardPatient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [appointments, setAppointments] = useState([]);
    const [isReviewModalOpen, setIsAddObervationModalOpen] = useState(false);
    const [appointmentToReview, setAppointmentToReview] = useState("");
    const [appointmentScores, setAppointmentScores] = useState([]);
    const [reviews, setReviews] = useState([
        { id: 1, type: "Puntualidad", rating: 5 },
        { id: 2, type: "Atencion", rating: 4.5 },
        { id: 3, type: "Limpieza", rating: 4.5 },
        { id: 4, type: "Disponibilidad", rating: 3 },
        { id: 5, type: "Precio", rating: 4.5 },
        { id: 6, type: "Comunicacion", rating: 2.5 },
    ]);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchPendingReviews = async () => {
        try {
            const response = await axios.get(
                `${apiURL}users/patient-pending-scores`,
                {
                    httpsAgent: agent,
                }
            );
            console.log(response.data);
            setAppointments(response.data.pending_scores);
        } catch (error) {
            toast.error("Error al obtener las reseñas pendientes");
            console.error(error);
        }
    };

    const getScores = async (id) => {
        try {
            const response = await axios.get(`${apiURL}users/score/${id}`, {
                httpsAgent: agent,
            });
            console.log(response.data.score_metrics);

            let tempReviews = [
                { id: 1, type: "Puntualidad", rating: 5 },
                { id: 2, type: "Atencion", rating: 4.5 },
                { id: 3, type: "Limpieza", rating: 4.5 },
                { id: 4, type: "Disponibilidad", rating: 3 },
                { id: 5, type: "Precio", rating: 4.5 },
                { id: 6, type: "Comunicacion", rating: 2.5 },
            ];

            tempReviews[0].rating = response.data.score_metrics.puntuality;
            tempReviews[1].rating = response.data.score_metrics.attention;
            tempReviews[2].rating = response.data.score_metrics.cleanliness;
            tempReviews[3].rating = response.data.score_metrics.availability;
            tempReviews[4].rating = response.data.score_metrics.price;
            tempReviews[5].rating = response.data.score_metrics.communication;

            setReviews(tempReviews);
        } catch (error) {
            toast.error("Error al obtener los puntajes");
            console.error(error);
        }
    };

    const handleOpenReviewModal = (appointment) => {
        setAppointmentToReview(appointment);
        getScores(appointment.physician_id);
        setIsAddObervationModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsAddObervationModalOpen(false);
    };

    const addReview = async () => {
        try {
            const response = await axios.post(
                `${apiURL}users/add-score`,
                {
                    appointment_id: appointmentToReview.id,
                    puntuality: reviews[0].rating,
                    attention: reviews[1].rating,
                    cleanliness: reviews[2].rating,
                    availability: reviews[3].rating,
                    price: reviews[4].rating,
                    communication: reviews[5].rating,
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

    const ratingModalStyles = {
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

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        fetchPendingReviews();
    }, []);

    return (
        <>
            {isReviewModalOpen && (
                <Modal
                    ariaHideApp={false}
                    isOpen={isReviewModalOpen}
                    onRequestClose={handleCloseReviewModal}
                    style={ratingModalStyles}
                >
                    <div className={styles["new-record-section"]}>
                        <div className={styles["title"]}>Carga de Reseña</div>

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

                        <button onClick={addReview}>Agregar</button>
                    </div>
                </Modal>
            )}

            <div className={styles.dashboard}>
                <TabBar highlight="Turnos" />

                <Header role="patient" />

                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
                    <>
                        <div className={styles["tab-content"]}>
                            <div className={styles.form}>
                                <div className={styles["title"]}>
                                    Turnos pendientes de reseña
                                </div>
                                <div className={styles["subtitle"]}>
                                    Usted tiene {appointments.length} turnos
                                    pendientes de reseña.
                                </div>
                                <div className={styles["subtitle"]}>
                                    Por favor, seleccione un turno para dejar su
                                    reseña; una vez que haya completado todas
                                    sus reseñas podrá volver al menu principal y
                                    solicitar un turno nuevo.
                                </div>

                                <Image
                                    src="/refresh_icon.png"
                                    alt="Notificaciones"
                                    className={styles["refresh-icon"]}
                                    width={200}
                                    height={200}
                                    onClick={() => {
                                        fetchAppointments();
                                        toast.info("Actualizando turnos...");
                                    }}
                                />
                                <div className={styles["appointments-section"]}>
                                    {appointments.length > 0 ? (
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
                                                        {/* {
                                                        appointment.physician
                                                            .specialty
                                                    } */}
                                                    </div>
                                                    <p>
                                                        Profesional:{" "}
                                                        {/* {appointment.physician
                                                        .first_name +
                                                        " " +
                                                        appointment.physician
                                                            .last_name} */}
                                                    </p>

                                                    <p>
                                                        Fecha y hora:{" "}
                                                        {new Date(
                                                            appointment.date *
                                                                1000
                                                        ).toLocaleString(
                                                            "es-AR"
                                                        )}
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
                                                                    "edit-button"
                                                                ]
                                                            }
                                                            onClick={() =>
                                                                handleOpenReviewModal(
                                                                    appointment
                                                                )
                                                            }
                                                        >
                                                            Agregar reseña
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
        </>
    );
};

export default DashboardPatient;

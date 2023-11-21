"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Footer, Header, TabBar } from "../components/header";
import ConfirmationModal from "../components/ConfirmationModal";
import { redirect } from "../components/userCheck";
import { toast } from "react-toastify";

registerLocale("es", es);

const DashboardPatient = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [physiciansAgenda, setPhysiciansAgenda] = useState({});
    const [date, setDate] = useState(new Date());
    const [dateToEdit, setDateToEdit] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);



    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState([]);

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
                { id: 2, type: "Atencion", rating: 4.5 },
                { id: 3, type: "Limpieza", rating: 4.5 },
                { id: 4, type: "Instalaciones", rating: 3 },
                { id: 5, type: "Precio", rating: 4.5 },
            ];

            tempReviews[0].rating = response.data.score_metrics.puntuality;
            tempReviews[1].rating = response.data.score_metrics.attention;
            tempReviews[2].rating = response.data.score_metrics.cleanliness;
            tempReviews[3].rating = response.data.score_metrics.facilities;
            tempReviews[4].rating = response.data.score_metrics.price;

            setReviews(tempReviews);
        } catch (error) {
            toast.error("Error al obtener los puntajes");
            console.error(error);
        }
    };

    const getRating = async (id) => {
        try {
            const response = await axios.get(`${apiURL}users/score/${id}`, {
                httpsAgent: agent,
            });
            console.log(response.data.score_metrics);

            let tempReviews = [
                { id: 1, type: "Puntualidad", rating: 5 },
                { id: 2, type: "Atencion", rating: 4.5 },
                { id: 3, type: "Limpieza", rating: 4.5 },
                { id: 4, type: "Instalaciones", rating: 3 },
                { id: 5, type: "Precio", rating: 4.5 },
            ];

            tempReviews[0].rating = response.data.score_metrics.puntuality;
            tempReviews[1].rating = response.data.score_metrics.attention;
            tempReviews[2].rating = response.data.score_metrics.cleanliness;
            tempReviews[3].rating = response.data.score_metrics.facilities;
            tempReviews[4].rating = response.data.score_metrics.price;

            setRating(tempReviews);
        } catch (error) {
            toast.error("Error al obtener los puntajes");
            console.error(error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${apiURL}appointments/`, {
                httpsAgent: agent,
            });
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            toast.error("Error al cargar turnos");
            console.error(error);
        }
    };

    const fetchSpecialties = async () => {
        try {
            const response = await axios.get(`${apiURL}specialties`, {
                httpsAgent: agent,
            });
            response.data.specialties == undefined
                ? setSpecialties([])
                : setSpecialties(response.data.specialties);
        } catch (error) {
            toast.error("Error al cargar especialidades");
            console.error(error);
        }
    };

    const fetchPhysicians = async (specialty) => {
        try {
            if (specialty) {
                const response = await axios.get(
                    `${apiURL}physicians/specialty/${specialty}`,
                    {
                        httpsAgent: agent,
                    }
                );
                response.data.physicians == undefined
                    ? setDoctors([])
                    : setDoctors(response.data.physicians);
            } else {
                setDoctors([]);
                setPhysiciansAgenda({});
            }
        } catch (error) {
            toast.error("Error al cargar médicos");
            console.error(error);
        }
    };

    const handleOpenEditModal = (appointment) => {
        setEditingAppointment({});
        console.log(appointment);
        console.log(editingAppointment);

        console.log(
            doctors.filter((doctor) => doctor.id == appointment.physician.id)
        );
        setIsEditModalOpen(true);
        setEditingAppointment({
            id: appointment.id,
            specialty: appointment.physician.specialty,
            doctor: appointment.physician,
            date: appointment.date,
            patient: appointment.patient,
            agenda: appointment.physician.agenda,
        });
    };

    const handleSaveAppointment = async () => {
        console.log(dateToEdit);
        console.log(editingAppointment);

        try {
            await axios.put(
                `${apiURL}appointments/${editingAppointment.id}`,
                {
                    date: Math.round(dateToEdit.getTime() / 1000),
                },
                {
                    httpsAgent: agent,
                }
            );
            fetchAppointments();
            setIsEditModalOpen(false);
            toast.info("Turno modificado exitosamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al modificar turno");
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleOpenRatingModal = (doctorId) => {
        getRating(doctorId);
        setIsRatingModalOpen(true);

        console.log(doctorId);
        //Logica de fecth review para el doctorID pasado por parametro
    };

    const handleCloseRatingModal = () => {
        setRating([]);
        setIsRatingModalOpen(false);
    };

    const saveAgenda = (doctorId) => {
        if (doctorId) {
            console.log(
                doctors.filter((doctor) => doctor.id == doctorId)[0].agenda
            );
            setPhysiciansAgenda(
                doctors.filter((doctor) => doctor.id == doctorId)[0].agenda
            );
            getScores(doctorId);
        } else {
            setPhysiciansAgenda({});
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
            await axios.delete(`${apiURL}appointments/${appointmentIdToDelete}`, {
                httpsAgent: agent,
            });
            toast.success("Turno eliminado exitosamente");
            fetchAppointments();
            setAppointmentIdToDelete(null); // Limpiar el ID del turno después de eliminar
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar turno");
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.info("Solicitando turno...");
        try {
            const response = await axios.post(
                `${apiURL}appointments/`,
                {
                    physician_id: selectedDoctor,
                    date: Math.round(date.getTime() / 1000),
                },
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Turno solicitado. Aguarde aprobacion del mismo");
            setSelectedDoctor("");
            setDate(new Date());
            setSelectedSpecialty("");
            setPhysiciansAgenda({});
            fetchAppointments();
        } catch (error) {
            console.error(error);
            toast.error("Error al solicitar turno");
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
        },
    };

    const ratingModalStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
        },
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        redirect(router);
        fetchSpecialties();
        fetchAppointments().then(() => setIsLoading(false));
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Modal de edición */}
            {isEditModalOpen && (
                <Modal
                    ariaHideApp={false}
                    isOpen={isEditModalOpen}
                    onRequestClose={handleCloseEditModal}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    {/* Campos de edición de especialidad, médico y fecha */}

                    <div className={styles.form}>
                        <div className={styles["title"]}>Editar Cita</div>

                        {/* Selector de fechas */}
                        <label htmlFor="fecha">Fechas disponibles:</label>

                        <DatePicker
                            locale="es"
                            selected={dateToEdit}
                            onChange={(date) => {
                                setDateToEdit(date);
                            }}
                            timeCaption="Hora"
                            timeIntervals={30}
                            showPopperArrow={false}
                            showTimeSelect
                            inline
                            filterDate={(date) => {
                                if (
                                    editingAppointment.doctor.agenda
                                        .working_days
                                ) {
                                    return editingAppointment.doctor.agenda.working_days.includes(
                                        date.getDay()
                                    );
                                }
                                return false;
                            }}
                            minDate={new Date()}
                            filterTime={(time) => {
                                if (
                                    editingAppointment.doctor.agenda
                                        .appointments &&
                                    !editingAppointment.doctor.agenda.appointments.includes(
                                        Math.round(time.getTime() / 1000)
                                    ) &&
                                    editingAppointment.doctor.agenda
                                        .working_hours &&
                                    time >= new Date()
                                ) {
                                    let workingHour =
                                        editingAppointment.doctor.agenda.working_hours.filter(
                                            (workingHour) =>
                                                workingHour.day_of_week ===
                                                date.getDay()
                                        )[0];
                                    let parsedTime =
                                        time.getHours() +
                                        time.getMinutes() / 60;
                                    return (
                                        workingHour.start_time <= parsedTime &&
                                        workingHour.finish_time > parsedTime
                                    );
                                }
                                return false;
                            }}
                        />
                    </div>

                    {/* Botones de Guardar y Cerrar */}
                    <button
                        className={styles["standard-button"]}
                        onClick={() => {
                            handleSaveAppointment();
                        }}
                    >
                        Guardar
                    </button>
                    <button
                        className={styles["standard-button"]}
                        onClick={() => {
                            handleCloseEditModal();
                            console.log(editingAppointment);
                        }}
                    >
                        Cerrar
                    </button>
                </Modal>
            )}

            {/* Modal de ratings */}
            {isRatingModalOpen && (
                <Modal
                    ariaHideApp={false}
                    isOpen={isRatingModalOpen}
                    onRequestClose={handleCloseRatingModal}
                    style={ratingModalStyles}
                    contentLabel="Example Modal"
                >
                    <div
                        key={rating.key}
                        className={styles["reviews-container"]}
                    >
                        {rating.length > 0 ? (
                            <>
                                {rating.map((review) => (
                                    <div
                                        key={review.id}
                                        className={styles["review"]}
                                    >
                                        <div
                                            className={
                                                styles["review-cards-container"]
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
                                                    {review.rating}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            // If there are no reviews, display the message
                            <label>No hay reviews</label>
                        )}
                    </div>

                    {/* Botones de Guardar y Cerrar */}
                    <button
                        className={styles["standard-button"]}
                        onClick={() => {}}
                    >
                        Guardar
                    </button>
                    <button
                        className={styles["standard-button"]}
                        onClick={() => handleCloseRatingModal()}
                    >
                        Cerrar
                    </button>
                </Modal>
            )}

            <TabBar highlight="Turnos" />

            <Header role="patient" />

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
                                    fetchAppointments();
                                    toast.info("Actualizando turnos...");
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
                                                    {
                                                        appointment.physician
                                                            .specialty
                                                    }
                                                </div>
                                                <p>
                                                    Profesional:{" "}
                                                    {appointment.physician
                                                        .first_name +
                                                        " " +
                                                        appointment.physician
                                                            .last_name}
                                                    <a
                                                        onClick={() => {
                                                            handleOpenRatingModal(
                                                                appointment
                                                                    .physician
                                                                    .id
                                                            );
                                                        }}
                                                        style={{
                                                            textDecoration:
                                                                "none",
                                                            color: "blue",
                                                        }}
                                                    >
                                                        {"    "} (Ver
                                                        Puntuacion)
                                                    </a>
                                                </p>

                                                <p>
                                                    Fecha y hora:{" "}
                                                    {new Date(
                                                        appointment.date * 1000
                                                    ).toLocaleString("es-AR")}
                                                </p>
                                                <div className={styles["appointment-buttons-container"]}>
                                                <button
                                                    className={styles["edit-button"]}
                                                    onClick={() => handleOpenEditModal(appointment)}
                                                >
                                                    Modificar
                                                </button>
                                                <button
                                                    className={styles["delete-button"]}
                                                    onClick={() => handleDeleteClick(appointment.id)}
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

                        {/* Formulario de selección de especialidad y doctor */}
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles["title"]}>
                                Solicitar un nuevo turno
                            </div>

                            {/* Selector de especialidades */}
                            <div className={styles["subtitle"]}>
                                Seleccione una especialidad
                            </div>
                            <select
                                id="specialty"
                                value={selectedSpecialty}
                                required
                                onChange={(e) => {
                                    setSelectedSpecialty(e.target.value);
                                    fetchPhysicians(e.target.value);
                                }}
                            >
                                <option value="">Especialidad</option>
                                {specialties.map((specialty) => (
                                    <option key={specialty} value={specialty}>
                                        {specialty}
                                    </option>
                                ))}
                            </select>

                            {/* Selector de médicos */}
                            <div className={styles["subtitle"]}>
                                Seleccione un médico
                            </div>
                            <select
                                id="doctor"
                                value={selectedDoctor}
                                required
                                onChange={(e) => {
                                    setSelectedDoctor(e.target.value);
                                    saveAgenda(e.target.value);
                                }}
                                disabled={!selectedSpecialty}
                            >
                                <option value="">Médico</option>
                                {doctors.map((doctor) => (
                                    <option
                                        key={doctor.id}
                                        value={doctor.id}
                                        agenda={doctor.agenda}
                                    >
                                        {doctor.first_name} {doctor.last_name}
                                    </option>
                                ))}
                            </select>

                            <div className={styles["subtitle"]}>
                                Puntuaciones del médico{" "}
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
                                                            styles[
                                                                "review-card"
                                                            ]
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
                                                            {review.rating}
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

                            {/* Selector de fechas */}
                            <div className={styles["subtitle"]}>
                                Seleccione una fecha
                            </div>
                            <div className={styles["physician-info-container"]}>
                                <div className={styles["datepicker-container"]}>
                                    <DatePicker
                                        locale="es"
                                        selected={date}
                                        onChange={(date) => {
                                            setDate(date);
                                        }}
                                        timeCaption="Hora"
                                        timeIntervals={30}
                                        showPopperArrow={false}
                                        showTimeSelect
                                        inline
                                        filterDate={(date) => {
                                            if (physiciansAgenda.working_days) {
                                                return physiciansAgenda.working_days.includes(
                                                    date.getDay()
                                                );
                                            }
                                            return false;
                                        }}
                                        minDate={new Date()}
                                        filterTime={(time) => {
                                            if (
                                                physiciansAgenda.appointments &&
                                                !physiciansAgenda.appointments.includes(
                                                    Math.round(
                                                        time.getTime() / 1000
                                                    )
                                                ) &&
                                                physiciansAgenda.working_hours &&
                                                time >= new Date()
                                            ) {
                                                let workingHour =
                                                    physiciansAgenda.working_hours.filter(
                                                        (workingHour) =>
                                                            workingHour.day_of_week ===
                                                            date.getDay()
                                                    )[0];
                                                let parsedTime =
                                                    time.getHours() +
                                                    time.getMinutes() / 60;
                                                return (
                                                    workingHour.start_time <=
                                                        parsedTime &&
                                                    workingHour.finish_time >
                                                        parsedTime
                                                );
                                            }
                                            return false;
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`${styles["submit-button"]} ${
                                    !selectedDoctor
                                        ? styles["disabled-button"]
                                        : ""
                                }`}
                                disabled={!selectedDoctor}
                            >
                                Solicitar turno
                            </button>
                        </form>
                    </div>
                    <Footer />
                </>
            )}
        </div>
    );
};

export default DashboardPatient;

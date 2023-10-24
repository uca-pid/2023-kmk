"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";
import { Header, Footer, TabBar } from "../components/header";
import userCheck from "../components/userCheck";
import { set } from "date-fns";

registerLocale("es", es);

const Dashboard = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [date, setDate] = useState(new Date());
    const [dateToEdit, setDateToEdit] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddObservationModalOpen, setIsAddObervationModalOpen] =
        useState(false);
    const [patientId, setPatientId] = useState("");
    const [newObservationDate, setNewObservationDate] = useState("");
    const [newObservationContent, setNewObservationContent] = useState("");
    const [editingAppointment, setEditingAppointment] = useState({
        id: null,
        specialty: "",
        doctor: {},
        date: new Date(),
        patient: "",
        agenda: {},
    });

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${apiURL}appointments`);
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            console.log(error);
        }
    };

    // const handleEditAppointment = (appointment) => {
    //     console.log(appointment);
    //     console.log(editingAppointment);
    //     setIsEditModalOpen(true);
    //     setEditingAppointment({
    //         id: appointment.id,
    //         specialty: appointment.physician.specialty,
    //         doctor: appointment.physician,
    //         date: appointment.date,
    //         patient: appointment.patient,
    //         agenda: appointment.physician.agenda,
    //     });
    //     console.log(editingAppointment);
    // };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setIsAddObervationModalOpen(false);
    };

    // const handleSaveAppointment = () => {
    //     setIsEditModalOpen(false);
    //     alert("Turno modificado exitosamente");
    //     fetchAppointments();
    // };

    const handleAddObservation = async (e) => {
        console.log(patientId, "handleAddObservation");
        console.log(newObservationDate, newObservationContent);
        e.preventDefault();
        try {
            const response = await axios.post(
                `${apiURL}records/update/${patientId}`,
                {
                    date: newObservationDate,
                    observation: newObservationContent,
                }
            );
            console.log(response);
            // fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        console.log(appointmentId);
        try {
            await axios.delete(`${apiURL}appointments/${appointmentId}`);
            alert("Turno eliminado exitosamente");
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

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        userCheck(router);
        fetchAppointments();
        const intervalId = setInterval(() => {
            fetchAppointments();
        }, 5 * 1000);
        return () => clearInterval(intervalId);
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
                        onClick={handleSaveAppointment}
                    >
                        Guardar
                    </button>
                    <button
                        className={styles["standard-button"]}
                        onClick={handleCloseEditModal}
                    >
                        Cerrar
                    </button>
                </Modal>
            )}

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
                        <div className={styles["title"]}>Nueva observación</div>

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

            <Header />
            {/* <TabBar /> */}

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>Mis Proximos Turnos</div>
                    <div className={styles["appointments-section"]}>
                        {appointments.length > 0 ? (
                            // If there are appointments, map through them and display each appointment
                            <div>
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={styles["appointment"]}
                                    >
                                        <p>
                                            Paciente:{" "}
                                            {appointment.patient.first_name +
                                                " " +
                                                appointment.patient.last_name}
                                        </p>
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
                                                    setIsAddObervationModalOpen(
                                                        true
                                                    );
                                                    setPatientId(
                                                        appointment.patient.id
                                                    );
                                                    setNewObservationDate(
                                                        appointment.date.toLocaleString(
                                                            "es-AR"
                                                        )
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
                                            {/* <button
                                                className={
                                                    styles["edit-button"]
                                                }
                                                onClick={() =>
                                                    handleEditAppointment(
                                                        appointment
                                                    )
                                                }
                                            >
                                                Modificar
                                            </button> */}

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

export default Dashboard;

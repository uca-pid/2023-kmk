"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";
import { Header, Footer, TabBar } from "../components/header";
import userCheck from "../components/userCheck";

registerLocale("es", es);

const Dashboard = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [date, setDate] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState({
        id: null,
        specialty: "",
        doctor: "",
        date: new Date(),
    });

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/appointments`
            );
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            console.log(error);
        }
    };

    const handleEditAppointment = (appointment) => {
        console.log(isEditModalOpen);
        setIsEditModalOpen(true);
        setEditingAppointment({
            id: appointment.id,
            specialty: appointment.specialty,
            doctor: appointment.doctor,
            date: new Date(appointment.date),
        });
        fetchAppointments();
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleSaveAppointment = () => {
        // Lógica para guardar los cambios de la cita en tu sistema
        // Esto puede variar según cómo esté implementada tu lógica de backend
        // Una vez guardados los cambios, cierra el modal
        // y actualiza la lista de citas o realiza cualquier otra acción necesaria
        setIsEditModalOpen(false);
        alert("Turno modificado exitosamente");
        fetchAppointments();
    };

    const handleDeleteAppointment = async (appointmentId) => {
        console.log(appointmentId);
        try {
            await axios.delete(
                `http://localhost:8080/appointments/${appointmentId}`
            );
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
                            //dateFormat="dd-MM-yyyy HH:mm"
                            selected={date}
                            onChange={(date) => {
                                setDate(date);
                                console.log(date);
                            }}
                            timeCaption="Hora"
                            timeIntervals={30}
                            showPopperArrow={false}
                            showTimeSelect
                            inline
                        />
                    </div>

                    {/* Botones de Guardar y Cerrar */}
                    <button
                        className={styles["stantard-button"]}
                        onClick={handleSaveAppointment}
                    >
                        Guardar
                    </button>
                    <button
                        className={styles["stantard-button"]}
                        onClick={handleCloseEditModal}
                    >
                        Cerrar
                    </button>
                </Modal>
            )}

            <Header />
            <TabBar />

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
                                                    styles["edit-button"]
                                                }
                                                onClick={() =>
                                                    handleEditAppointment(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Modificar
                                            </button>

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

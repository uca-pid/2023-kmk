"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./dashboard-patient.module.css";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";

registerLocale("es", es);

const Dashboard = () => {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [availableAppointments, setAvailableAppointments] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [physiciansAgenda, setPhysiciansAgenda] = useState({});
    const [date, setDate] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState({
        id: null,
        specialty: "",
        doctor: "",
        date: new Date(),
    });

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        const userCheck = async () => {
            console.log("Checking user profile");

            try {
                const response = await axios.get(
                    `http://localhost:8080/users/profile/`
                );

                console.log(response.data.profile);
                switch (response.data.profile) {
                    case "Admin":
                        console.log("Checking if admin");
                        router.push("/dashboard-admin");
                        break;
                    case "Physician":
                        console.log("Checking if physician");
                        router.push("/dashboard-physician");
                        break;
                    case "Patient":
                        console.log("Checking if patient");
                        router.push("/dashboard-patient");
                        break;
                    default:
                        console.log("Error");
                        break;
                }
            } catch (error) {
                console.log(error.response.data.detail);
                switch (error.response.data.detail) {
                    case "User must be logged in":
                        router.push("/");
                        break;
                    case "User has already logged in":
                        router.push("/dashboard-redirect");
                        break;
                }
            }
        };

        const fetchAppointments = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/appointments`
                );
                console.log(response.data.appointments);
                response.data.appointments == undefined
                    ? setAppointments([])
                    : setAppointments(response.data.appointments);
            } catch (error) {
                if (error.response.data.detail == "User must be logged in") {
                    console.error(error);
                    router.push("/");
                }
            }
        };

        const fetchSpecialties = async () => {
            const response = await axios.get(
                `http://localhost:8080/specialties`
            );
            console.log(response.data.specialties);
            response.data.specialties == undefined
                ? setSpecialties([])
                : setSpecialties(response.data.specialties);
        };
        userCheck();
        fetchAppointments();
        fetchSpecialties();
        console.log(specialties);
    }, []);

    const fetchPhysicians = async (specialty) => {
        const response = await axios.get(
            `http://localhost:8080/physicians/specialty/${specialty}`
        );
        console.log(response.data.physicians);
        response.data.physicians == undefined
            ? setDoctors([])
            : setDoctors(response.data.physicians);
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
    };

    const handleDeleteAppointment = async (appointmentId) => {
        await axios.delete(
            `http://localhost:8080/appointments/${appointmentId}`
        );
        alert("Turno eliminado exitosamente");
        router.push("/dashboard");
    };

    const handleSubmit = async (e) => {
        const response = await axios.post(
            `http://localhost:8080/appointments`,
            {
                physician_id: selectedDoctor,
                date: Math.round(date.getTime() / 1000),
            }
        );
        console.log(response.data.specialties);
        response.data.specialties == undefined
            ? setSpecialties([])
            : setSpecialties(response.data.specialties);
        alert("Turno solicitado exitosamente");
        router.push("/dashboard-patient");
    };

    const handleLogoClick = () => {
        router.push("/dashboard-patient");
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
            <header className={styles.header}>
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
                        axios.delete;
                        router.push("/");
                    }}
                />

                <div className={styles["tab-bar"]}>
                    <div className={styles.tab} onClick={handleLogoClick}>
                        Turnos
                    </div>
                    <div className={styles.tab_disabled}>Mi Ficha</div>
                </div>
            </header>

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
                                            Profesional:{" "}
                                            {appointment.doctorName}
                                        </p>
                                        <p>Fecha y hora: {appointment.date}</p>
                                        <div
                                            className={
                                                styles[
                                                    "appointment-buttons-container"
                                                ]
                                            }
                                        >
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

                {/* Formulario de selección de especialidad y doctor */}
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Solicitar un nuevo turno
                    </div>

                    {/* Selector de especialidades */}
                    <label htmlFor="specialty">Especialidad:</label>
                    <select
                        id="specialty"
                        value={selectedSpecialty}
                        onChange={(e) => {
                            setSelectedSpecialty(e.target.value);
                            fetchPhysicians(e.target.value);
                        }}
                    >
                        <option value="">Selecciona una especialidad</option>
                        {specialties.map((specialty) => (
                            <option key={specialty} value={specialty}>
                                {specialty}
                            </option>
                        ))}
                    </select>

                    {/* Selector de médicos */}
                    <label htmlFor="doctor">Médico:</label>
                    <select
                        id="doctor"
                        value={selectedDoctor}
                        onChange={(e) => {
                            setSelectedDoctor(e.target.value);
                            setPhysiciansAgenda(
                                doctors.filter(
                                    (doctor) => doctor.id == e.target.value
                                )[0].agenda
                            );
                        }}
                        disabled={!selectedSpecialty} // Deshabilita si no se ha seleccionado una especialidad
                    >
                        <option value="">Selecciona un médico</option>
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

                    {/* Selector de fechas */}
                    <label htmlFor="fecha">Fechas disponibles:</label>

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
                                    Math.round(time.getTime() / 1000)
                                ) &&
                                physiciansAgenda.working_hours
                            ) {
                                let workingHour =
                                    physiciansAgenda.working_hours.filter(
                                        (workingHour) =>
                                            workingHour.day_of_week ===
                                            date.getDay()
                                    )[0];
                                let parsedTime =
                                    time.getHours() + time.getMinutes() / 60;
                                return (
                                    workingHour.start_time <= parsedTime &&
                                    workingHour.finish_time >= parsedTime
                                );
                            }
                            return false;
                        }}
                    />

                    <button
                        type="submit"
                        className={styles["submit-button"]}
                        onClick={handleSubmit}
                    >
                        Solicitar turno
                    </button>
                </div>
            </div>

            <footer className={styles["page-footer"]}>
                <p>Derechos de autor © 2023 KMK</p>
            </footer>
        </div>
    );
};

export default Dashboard;

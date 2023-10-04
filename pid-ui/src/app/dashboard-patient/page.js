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
import { Footer, Header, TabBar } from "../components/header";

registerLocale("es", es);

const Dashboard = () => {
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
    const [editingAppointment, setEditingAppointment] = useState({
        id: null,
        specialty: "",
        doctor: doctors[0],
        date: new Date(),
        patient: "",
        agenda: {},
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

    const userCheck = async () => {
        // console.log("Checking user profile");

        try {
            const response = await axios.get(
                `http://localhost:8080/users/profile/`
            );

            // console.log(response.data.profile);
            switch (response.data.profile) {
                case "Admin":
                    // console.log("Checking if admin");
                    router.push("/dashboard-admin");
                    break;
                case "Physician":
                    // console.log("Checking if physician");
                    router.push("/dashboard-physician");
                    break;
                case "Patient":
                    // console.log("Checking if patient");
                    router.push("/dashboard-patient");
                    break;
                default:
                    // console.error("Error");
                    break;
            }
        } catch (error) {
            console.error(error.response.data.detail);
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

    const fetchSpecialties = async () => {
        const response = await axios.get(`http://localhost:8080/specialties`);
        response.data.specialties == undefined
            ? setSpecialties([])
            : setSpecialties(response.data.specialties);
    };

    const fetchPhysicians = async (specialty) => {
        if (specialty) {
            const response = await axios.get(
                `http://localhost:8080/physicians/specialty/${specialty}`
            );
            console.log(response.data.physicians);
            response.data.physicians == undefined
                ? setDoctors([])
                : setDoctors(response.data.physicians);
        } else {
            setDoctors([]);
            setPhysiciansAgenda({});
        }
    };

    const handleEditAppointment = (appointment) => {
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
        console.log(editingAppointment);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const saveAgenda = (doctorId) => {
        if (doctorId)
            setPhysiciansAgenda(
                doctors.filter((doctor) => doctor.id == doctorId)[0].agenda
            );
        else setPhysiciansAgenda({});
    };

    const handleSaveAppointment = () => {
        // Lógica para guardar los cambios de la cita en tu sistema
        // Esto puede variar según cómo esté implementada tu lógica de backend
        // Una vez guardados los cambios, cierra el modal
        // y actualiza la lista de citas o realiza cualquier otra acción necesaria
        setIsEditModalOpen(false);
        console.log(editingAppointment);
        alert("Turno modificado exitosamente");
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

    const handleSubmit = async (e) => {
        const response = await axios.post(
            `http://localhost:8080/appointments`,
            {
                physician_id: selectedDoctor,
                date: Math.round(date.getTime() / 1000),
            }
        );
        alert("Turno solicitado exitosamente");
        fetchAppointments();
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

        userCheck();
        fetchSpecialties();
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
                                        .working_hours
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

            {/* </header> */}
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
                                            {appointment.physician.first_name +
                                                " " +
                                                appointment.physician.last_name}
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
                                                        appointment
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
                            console.log(selectedSpecialty);
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
                            saveAgenda(e.target.value);
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
                                    workingHour.finish_time > parsedTime
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
            <Footer />
        </div>
    );
};

export default Dashboard;

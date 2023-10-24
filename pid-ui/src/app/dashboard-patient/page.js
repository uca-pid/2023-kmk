"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/styles.module.css";
import { useRouter } from "next/navigation";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Modal from "react-modal";
import axios from "axios";
import { Footer, Header, TabBar } from "../components/header";
import userCheck from "../components/userCheck";
import { toast } from "react-toastify";

registerLocale("es", es);

const DashboardPatient = () => {
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
            const response = await axios.get(`${apiURL}appointments/`);
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSpecialties = async () => {
        try {
            const response = await axios.get(`${apiURL}specialties`);
            response.data.specialties == undefined
                ? setSpecialties([])
                : setSpecialties(response.data.specialties);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPhysicians = async (specialty) => {
        try {
            if (specialty) {
                const response = await axios.get(
                    `${apiURL}physicians/specialty/${specialty}`
                );
                response.data.physicians == undefined
                    ? setDoctors([])
                    : setDoctors(response.data.physicians);
            } else {
                setDoctors([]);
                setPhysiciansAgenda({});
            }
        } catch (error) {
            console.error(error);
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

    const handleSaveAppointment = async () => {
        try {
            await axios.put(`${apiURL}appointments/${editingAppointment.id}`, {
                date: Math.round(dateToEdit.getTime() / 1000),
            });
            fetchAppointments();
        } catch (error) {
            console.error(error);
        }
        setIsEditModalOpen(false);
        toast.info("Turno modificado exitosamente");
    };

    const handleDeleteAppointment = async (appointmentId) => {
        try {
            await axios.delete(`${apiURL}appointments/${appointmentId}`);
            toast.info("Turno eliminado exitosamente");
            fetchAppointments();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiURL}appointments/`, {
                physician_id: selectedDoctor,
                date: Math.round(date.getTime() / 1000),
            });
            toast.info("Turno solicitado exitosamente");
            fetchAppointments();
        } catch (error) {
            console.error(error);
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
        fetchSpecialties();
        fetchAppointments();
        // const intervalId = setInterval(() => {
        //     fetchAppointments();
        // }, 5 * 1000);
        // return () => clearInterval(intervalId);
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

            <Header />
            <TabBar highlight="Turnos" />

            {/* </header> */}
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
                                            {appointment.physician.specialty}
                                        </div>
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
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles["title"]}>
                        Solicitar un nuevo turno
                    </div>

                    {/* Selector de especialidades */}
                    <label htmlFor="specialty">Especialidad:</label>
                    <select
                        id="specialty"
                        value={selectedSpecialty}
                        required
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
                        required
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
                        className={`${styles["submit-button"]} ${
                            !selectedDoctor ? styles["disabled-button"] : ""
                        }`}
                        disabled={!selectedDoctor}
                    >
                        Solicitar turno
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardPatient;

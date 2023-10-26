import React from "react";
import styles from "../styles/styles.module.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { toast } from "react-toastify";

const agent = new https.Agent({
    rejectUnauthorized: false,
});

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

const EditAppointmentModal = (props) => {
    const handleSaveAppointment = async () => {
        try {
            await axios.put(
                `${props.apiURL}appointments/${props.editingAppointment.id}`,
                {
                    date: Math.round(props.dateToEdit.getTime() / 1000),
                },
                {
                    httpsAgent: agent,
                }
            );
            fetchAppointments();
        } catch (error) {
            console.error(error);
        }
        setIsEditModalOpen(false);
        toast.info("Turno modificado exitosamente");
    };

    return (
        <Modal
            ariaHideApp={false}
            isOpen={props.isEditModalOpen}
            onRequestClose={props.setIsEditModalOpen(false)}
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
                    selected={props.dateToEdit}
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
                            props.editingAppointment.doctor.agenda.working_days
                        ) {
                            return props.editingAppointment.doctor.agenda.working_days.includes(
                                date.getDay()
                            );
                        }
                        return false;
                    }}
                    minDate={new Date()}
                    filterTime={(time) => {
                        if (
                            props.editingAppointment.doctor.agenda
                                .appointments &&
                            !props.editingAppointment.doctor.agenda.appointments.includes(
                                Math.round(time.getTime() / 1000)
                            ) &&
                            props.editingAppointment.doctor.agenda
                                .working_hours &&
                            time >= new Date()
                        ) {
                            let workingHour =
                                props.editingAppointment.doctor.agenda.working_hours.filter(
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
                onClick={props.setIsEditModalOpen(false)}
            >
                Cerrar
            </button>
        </Modal>
    );
};

export { EditAppointmentModal };

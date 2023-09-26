"use client";

import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { mockAppointments, mockDoctors, mockSpecialties } from "./mockData";
import Modal from "react-modal";

registerLocale("es", es);

const Dashboard = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [doctors, setDoctors] = useState(mockDoctors);
  const [specialties, setSpecialties] = useState(mockSpecialties);
  const [availableAppointments, setAvailableAppointments] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState({
    id: null,
    specialty: "",
    doctor: "",
    date: new Date(),
  });

  // useEffect(() => {
  //   // Fetch the patient's appointments data from an API or other source
  //   // Update the `appointments` state with the fetched data
  //   // For example:
  //   // const fetchedAppointments = fetchAppointments(); // Replace with your fetch logic
  //   // setAppointments(fetchedAppointments);
  // }, []);

  // // Efecto para cargar las especialidades al cargar la página
  // useEffect(() => {
  //   // Llamada a la API para obtener la lista de especialidades
  //   fetch("/api/especialidades")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setSpecialties(data);
  //     })
  //     .catch((error) => {
  //       console.error("Error al obtener las especialidades:", error);
  //     });
  // }, []);

  // // Efecto para cargar los médicos cuando se selecciona una especialidad
  // useEffect(() => {
  //   if (selectedSpecialty) {
  //     // Llamada a la API para obtener la lista de médicos para la especialidad seleccionada
  //     fetch(`/api/medicos?especialidad=${selectedSpecialty}`)
  //       .then((response) => response.json())
  //       .then((data) => {
  //         setDoctors(data);
  //       })
  //       .catch((error) => {
  //         console.error("Error al obtener los médicos:", error);
  //       });
  //   } else {
  //     // Si no se selecciona una especialidad, borra la lista de médicos
  //     setDoctors([]);
  //   }
  // }, [selectedSpecialty]);

  // // Efecto para cargar los turnos disponibles cuando se selecciona un médico
  // useEffect(() => {
  //   if (selectedDoctor) {
  //     // Llamada a la API para obtener los turnos disponibles para el médico seleccionado
  //     fetch(`/api/turnos?medico=${selectedDoctor}`)
  //       .then((response) => response.json())
  //       .then((data) => {
  //         setAvailableAppointments(data);
  //       })
  //       .catch((error) => {
  //         console.error("Error al obtener los turnos disponibles:", error);
  //       });
  //   } else {
  //     // Si no se selecciona un médico, borra la lista de turnos disponibles
  //     setAvailableAppointments([]);
  //   }
  // }, [selectedDoctor]);

  const handleEditAppointment = (appointment) => {
    // Abre el modal de edición y establece los valores de la cita seleccionada
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
    // Cierra el modal de edición
    setIsEditModalOpen(false);
  };

  const handleSaveAppointment = () => {
    // Lógica para guardar los cambios de la cita en tu sistema
    // Esto puede variar según cómo esté implementada tu lógica de backend
    // Una vez guardados los cambios, cierra el modal
    // y actualiza la lista de citas o realiza cualquier otra acción necesaria
    setIsEditModalOpen(false);
  };

  const handleDeleteAppointment = (appointmentId) => {
    // Aquí puedes implementar la lógica para eliminar el turno
    // Puedes hacer una llamada a la API o realizar otras acciones necesarias
  };

  const handleSubmit = async (e) => {
    alert("Turno solicitado exitosamente");
    router.push("/dashboard");
  };

  const handleLogoClick = () => {
    router.push("/dashboard");
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
          //onAfterOpen={afterOpenModal}
          onRequestClose={handleCloseEditModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {/* Campos de edición de especialidad, médico y fecha */}

          <div className={styles.form}>
            <div className={styles["title"]}>Editar Cita</div>
            {/* <div className={styles["subtitle"]}>
              Seleccione un nuevo horario para su cita
            </div> */}

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

      <header className={styles.header} onClick={handleLogoClick}>
        <img src="/logo.png" alt="Logo de la empresa" className={styles.logo} />

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
          {/* Section for displaying patient's reserved appointments */}
          <div className={styles["appointments-section"]}>
            {appointments.length > 0 ? (
              // If there are appointments, map through them and display each appointment
              <div>
                {appointments.map((appointment) => (
                  <div key={appointment.id} className={styles["appointment"]}>
                    <p>Profesional: {appointment.doctorName}</p>
                    <p>Fecha y hora: {appointment.date}</p>
                    <div className={styles["appointment-buttons-container"]}>
                      <button
                        className={styles["edit-button"]}
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        Modificar
                      </button>

                      <button
                        className={styles["delete-button"]}
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // If there are no appointments, display the message
              <div className={styles["subtitle"]}>No hay turnos pendientes</div>
            )}
          </div>
        </div>

        {/* Formulario de selección de especialidad y doctor */}
        <div className={styles.form}>
          <div className={styles["title"]}>Solicitar un nuevo turno</div>

          {/* Selector de especialidades */}
          <label htmlFor="specialty">Especialidad:</label>
          <select
            id="specialty"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">Selecciona una especialidad</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>

          {/* Selector de médicos */}
          <label htmlFor="doctor">Médico:</label>
          <select
            id="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={!selectedSpecialty} // Deshabilita si no se ha seleccionado una especialidad
          >
            <option value="">Selecciona un médico</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>

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

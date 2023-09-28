const mockAppointments = [
  {
    id: 1,
    date: "2023-09-15 10:25",
    doctorName: "Dr. Smith",
    // Agrega más detalles de la cita según sea necesario
  },
  {
    id: 2,
    date: "2023-09-20 15:40",
    doctorName: "Dr. Johnson",
    // Agrega más detalles de la cita según sea necesario
  },
  // Agrega más citas si es necesario
];

// Datos de especialidades
const mockSpecialties = [
  { id: 1, name: "Cardiología" },
  { id: 2, name: "Dermatología" },
  { id: 3, name: "Gastroenterología" },
  // Agrega más especialidades si es necesario
];

// Datos de médicos
const mockDoctors = [
  { id: 1, name: "Dr. Smith", specialityId: 1 },
  { id: 2, name: "Dr. Johnson", specialityId: 2 },
  { id: 3, name: "Dr. Brown", specialityId: 1 },
  { id: 4, name: "Dr. Davis", specialityId: 3 },
  // Agrega más médicos si es necesario
];

export { mockAppointments, mockSpecialties, mockDoctors };

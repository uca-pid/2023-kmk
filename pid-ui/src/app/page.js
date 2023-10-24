import { ToastContainer } from "react-toastify";
import Landing from "./landing/page.js";
import Admin from "./dashboard-admin/page.js";
import DashboardPatient from "./dashboard-patient/page.js";
import DashboardPhysician from "./dashboard-physician/page.js";
import MedicalRecords from "./medical-records/page.js";
import MyRecord from "./my-record/page.js";
import Registro from "./registro/page.js";
import UserProfile from "./user/page.js";

const HomePage = () => {
    return (
        <div>
            <Landing />
        </div>
    );
};

export default HomePage;

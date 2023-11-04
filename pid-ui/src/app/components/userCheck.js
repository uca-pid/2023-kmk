import axios from "axios";
import https from "https";
import { toast } from "react-toastify";

const agent = new https.Agent({
    rejectUnauthorized: false,
});

const loginCheck = async (router) => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    try {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get(`${apiURL}users/role`, {
            httpsAgent: agent,
        });
        if (response.status == 200) {
            console.log(response.data.roles);
            switch (response.data.roles[0]) {
                case "admin":
                    router.replace("/dashboard-admin");
                    break;
                case "physician":
                    router.replace("/physician-agenda");
                    break;
                case "patient":
                    router.replace("/patient-dashboard");
                    break;
                default:
                    router.replace("/");
                    break;
            }
        }
    } catch (error) {
        console.error(error);

        switch (error.response.data.detail) {
            case "User must be logged in":
                router.replace("/");
                break;
            case "Physician pending":
                toast.error(
                    "Aprobacion pendiente \n Contacte al administrador"
                );
                break;
            case "Physician approved":
                toast.error(
                    "Aprobacion pendiente \n Contacte al administrador"
                );
                break;
            case "Physician denied":
                toast.error(
                    "Aprobacion rechazada \n Contacte al administrador"
                );
                break;
            case "Physician blocked":
                toast.error("Usuario bloqueado \n Contacte al administrador");
                break;
        }
    }
};

const redirect = async (router) => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    try {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get(`${apiURL}users/role`, {
            httpsAgent: agent,
        });
        if (response.status == 200) {
            switch (response.data.roles[0]) {
                case "admin":
                    router.replace("/dashboard-admin");
                    break;
                case "physician":
                    router.replace("/physician-agenda");
                    break;
                case "patient":
                    router.replace("/patient-dashboard");
                    break;
                default:
                    router.replace("/");
                    break;
            }
        }
    } catch (error) {
        console.error(error);

        switch (error.response.data.detail) {
            case "User must be logged in":
                router.replace("/");
                break;
        }
    }
};

const userCheck = async (router) => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    try {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get(`${apiURL}users/role`, {
            httpsAgent: agent,
        });
    } catch (error) {
        console.error(error);

        switch (error.response.data.detail) {
            case "User must be logged in":
                router.replace("/");
                break;
        }
    }
};

export { loginCheck, redirect, userCheck };

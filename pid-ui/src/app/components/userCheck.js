import axios from "axios";

const userCheck = async (router) => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    try {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get(`${apiURL}users/role`);
        if (response.status == 200) {
            if (response.data.roles.includes("admin")) {
                router.replace("/dashboard-admin");
            } else if (response.data.roles.includes("physician")) {
                router.replace("/physician-agenda");
            } else if (response.data.roles.includes("patient")) {
                router.replace("/dashboard-patient");
            } else {
                router.replace("/");
            }
        } else {
            router.replace("/");
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

export default userCheck;

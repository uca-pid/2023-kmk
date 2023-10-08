import axios from "axios";

const userCheck = async (router) => {
    // console.log("Checking user profile");
    axios.defaults.headers.common = {
        Authorization: `bearer ${localStorage.getItem("token")}`,
    };

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
                // console.log("Error");
                break;
        }
    } catch (error) {
        console.error(error);
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

export default userCheck;

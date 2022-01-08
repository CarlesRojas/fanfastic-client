import { createContext } from "react";
export const API = createContext();

const API_VERSION = "api_v1";
const API_URL = "https://fanfastic.herokuapp.com/"; // "http://localhost:3100/"

const APIProvider = (props) => {
    // #################################################
    //   AUTH API
    // #################################################

    const register = async (username, email, password) => {
        const postData = { username, email, password };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/register`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();
            return response;
        } catch (error) {
            return { error: `Sign Up Error: ${error}` };
        }
    };

    return (
        <API.Provider
            value={{
                // AUTH API
                register,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;

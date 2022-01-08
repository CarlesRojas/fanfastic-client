import { createContext, useContext } from "react";

// Contexts
import { Utils } from "./Utils";
import { Data } from "./Data";

const API_VERSION = "api_v1";
const API_URL = "https://fanfastic.herokuapp.com/"; // "http://localhost:3100/"

export const API = createContext();
const APIProvider = (props) => {
    const { setCookie, getCookie, clearCookies } = useContext(Utils);
    const { APP_NAME, token, username, userID } = useContext(Data);

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
            return { error: `Sign up error: ${error}` };
        }
    };

    const login = async (email, password) => {
        const postData = { email, password };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/login`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            // Return with error if it is the case
            if ("error" in response) return response;

            // Save the new data
            if ("token" in response) token.current = response.token;
            if ("username" in response) username.current = response.username;
            if ("id" in response) userID.current = response.id;

            // Set token cookie
            setCookie(`${APP_NAME}_token`, response.token, 365 * 100);
            setCookie(`${APP_NAME}_name`, response.username, 365 * 100);
            setCookie(`${APP_NAME}_id`, response.id, 365 * 100);

            return response;
        } catch (error) {
            return { error: `Login error: ${error}` };
        }
    };

    const logout = () => {
        token.current = null;
        username.current = null;
        userID.current = null;

        clearCookies();
    };

    const isLoggedIn = () => {
        const tokenInCookie = getCookie(`${APP_NAME}_token`);
        const nameInCookie = getCookie(`${APP_NAME}_name`);
        const idInCookie = getCookie(`${APP_NAME}_id`);

        // If they exist, save in data and return true
        if (tokenInCookie && nameInCookie && idInCookie) {
            token.current = tokenInCookie;
            username.current = nameInCookie;
            userID.current = idInCookie;

            // Renew expiration
            setCookie(`${APP_NAME}_token`, tokenInCookie, 365 * 100);
            setCookie(`${APP_NAME}_name`, nameInCookie, 365 * 100);
            setCookie(`${APP_NAME}_id`, idInCookie, 365 * 100);

            return true;
        }
        return false;
    };

    const changeEmail = async (password, newEmail) => {
        const postData = { password, email: newEmail };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/changeEmail`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();
            return response;
        } catch (error) {
            return { error: `Change email error: ${error}` };
        }
    };

    const changeUsername = async (password, newUsername) => {
        const postData = { password, username: newUsername };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/changeUsername`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            // Save in the cookies and Data
            if ("success" in response) {
                username.current = newUsername;
                setCookie(`${APP_NAME}_name`, newUsername, 365);
            }

            return response;
        } catch (error) {
            return { error: `Change username error: ${error}` };
        }
    };

    const changePassword = async (password, newPassword) => {
        const postData = { password, newPassword };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/changePassword`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            return response;
        } catch (error) {
            return { error: `Change password error: ${error}` };
        }
    };

    const deleteAccount = async (password) => {
        const postData = { password };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/deleteAccount`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            // Logout
            if ("success" in response) logout();

            return response;
        } catch (error) {
            return { error: `Delete account error: ${error}` };
        }
    };

    return (
        <API.Provider
            value={{
                // AUTH API
                register,
                login,
                logout,
                isLoggedIn,
                changeEmail,
                changeUsername,
                changePassword,
                deleteAccount,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;

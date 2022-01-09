import { createContext, useContext } from "react";

// Contexts
import { Utils } from "./Utils";
import { Data } from "./Data";

const API_VERSION = "api_v1";
const API_URL = "http://localhost:3100/"; //"https://fanfastic.herokuapp.com/"

export const API = createContext();
const APIProvider = (props) => {
    const { setCookie, getCookie, clearCookies } = useContext(Utils);
    const { APP_NAME, token, user, historic } = useContext(Data);

    // #################################################
    //   AUTH API
    // #################################################

    const register = async (username, email, password) => {
        const now = new Date();
        const timezoneOffsetInMs = -now.getTimezoneOffset() * 60 * 1000;

        const postData = { username, email, password, timezoneOffsetInMs };

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
            return { error: `Register error: ${error}` };
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

            // Save token
            if ("token" in response) token.current = response.token;

            // Set token cookie
            setCookie(`${APP_NAME}_token`, response.token, 365 * 100);

            return response;
        } catch (error) {
            return { error: `Login error: ${error}` };
        }
    };

    const getUserInfo = async () => {
        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/getUserInfo`, {
                method: "get",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });

            const response = await rawResponse.json();

            // Return with error if it is the case
            if ("error" in response) return response;

            // Save user info
            user.current = response;

            return response;
        } catch (error) {
            return { error: `Get user info error: ${error}` };
        }
    };

    const logout = () => {
        token.current = null;
        user.current = null;

        clearCookies();
    };

    const tryToLogInWithToken = async () => {
        const tokenInCookie = getCookie(`${APP_NAME}_token`);

        // If token in cookie
        if (tokenInCookie) {
            token.current = tokenInCookie;

            // Renew expiration
            setCookie(`${APP_NAME}_token`, tokenInCookie, 365 * 100);

            const result = await getUserInfo();
            if ("error" in result) {
                logout();
                return false;
            }

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

            if ("error" in response) return response;

            // Update local user data
            if (user.current && "email" in user.current) user.current.email = newEmail;

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

            if ("error" in response) return response;

            // Update local user data
            if (user.current && "username" in user.current) user.current.username = newUsername;

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

    // #################################################
    //   FASTING API
    // #################################################

    const setFastDesiredStartTime = async (fastDesiredStartTimeInMinutes) => {
        const postData = { fastDesiredStartTimeInMinutes };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/setFastDesiredStartTime`, {
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
            return { error: `Set fast desired start time error: ${error}` };
        }
    };

    const setFastObjective = async (fastObjectiveInMinutes) => {
        const postData = { fastObjectiveInMinutes };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/setFastObjective`, {
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
            return { error: `Set fast objective error: ${error}` };
        }
    };

    const startFasting = async () => {
        const date = new Date();
        const timezoneOffsetInMs = -date.getTimezoneOffset() * 60 * 1000;

        const postData = { date, timezoneOffsetInMs };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/startFasting`, {
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
            return { error: `Start Fasting error: ${error}` };
        }
    };

    const stopFasting = async () => {
        const date = new Date();
        const timezoneOffsetInMs = -date.getTimezoneOffset() * 60 * 1000;

        const postData = { date, timezoneOffsetInMs };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/stopFasting`, {
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
            return { error: `Stop Fasting error: ${error}` };
        }
    };

    const useWeeklyPass = async () => {
        const date = new Date();
        const timezoneOffsetInMs = -date.getTimezoneOffset() * 60 * 1000;

        const postData = { date, timezoneOffsetInMs };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/useWeeklyPass`, {
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
            return { error: `Use weekly pass error: ${error}` };
        }
    };

    const getMonthFastEntries = async () => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const postData = { month, year };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/getMonthFastEntries`, {
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

            if ("error" in response) return response;

            if ("historic" in response) {
                // Update local data
                if (!(year in historic.current)) historic.current[year] = {};
                historic.current[year][month] = response;
                return true;
            }

            return false;
        } catch (error) {
            return { error: `Get month fast entries error: ${error}` };
        }
    };

    return (
        <API.Provider
            value={{
                // AUTH API
                register,
                login,
                getUserInfo,
                logout,
                tryToLogInWithToken,
                changeEmail,
                changeUsername,
                changePassword,
                deleteAccount,

                // FASTING API
                setFastDesiredStartTime,
                setFastObjective,
                startFasting,
                stopFasting,
                useWeeklyPass,
                getMonthFastEntries,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;

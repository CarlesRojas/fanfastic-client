import { createContext, useContext } from "react";

// Contexts
import { Utils } from "./Utils";
import { Data } from "./Data";

const API_VERSION = "api_v1";
const API_URL = "https://fanfastic.herokuapp.com/"; // "http://localhost:3100/";
const PUBLIC_VAPID_KEY = "BODB_tctXz2EZwqHdAJF879SvVP8aiOOljr5ECGebzv9NOJXhBh_8dR5xzZ3f6sIiTsk18IZdVWRvOSVmvD38nc";

export const API = createContext();
const APIProvider = (props) => {
    const { setCookie, getCookie, clearCookies, urlBase64ToUint8Array } = useContext(Utils);
    const { APP_NAME, token, user, fastHistoric, weightHistoric } = useContext(Data);

    // #################################################
    //   AUTH API
    // #################################################

    const register = async (username, email, password) => {
        const now = new Date();
        const timezoneOffsetInMs = -now.getTimezoneOffset() * 60 * 1000;

        const postData = { username, email: email.toLowerCase(), password, timezoneOffsetInMs };

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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

            return response;
        } catch (error) {
            return { error: `Unknown registration error` };
        }
    };

    const login = async (email, password) => {
        const postData = { email: email.toLowerCase(), password };

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
            if ("token" in response) {
                token.current = response.token;
                setCookie(`${APP_NAME}_token`, response.token, 365 * 100);
            }

            return response;
        } catch (error) {
            return { error: "Unknown login error" };
        }
    };

    const testToken = async (token) => {
        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/user/testToken`, {
                method: "get",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token,
                },
            });

            const response = await rawResponse.json();

            // Return with error if it is the case
            if ("error" in response) return response;

            return response;
        } catch (error) {
            return { error: `Test token error: ${error}` };
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
                    token: token.current,
                },
            });

            const response = await rawResponse.json();

            // Save new user
            if ("error" in response) {
                clearCookies(APP_NAME);
                return response;
            }
            user.current = response;

            return response;
        } catch (error) {
            clearCookies(APP_NAME);
            return { error: `Get user info error: ${error}` };
        }
    };

    const isLoggedIn = async () => {
        const tokenInCookie = getCookie(`${APP_NAME}_token`);
        if (!tokenInCookie) return false;

        const response = await testToken(tokenInCookie);
        if ("error" in response) return false;

        // Set token
        token.current = tokenInCookie;
        setCookie(`${APP_NAME}_token`, tokenInCookie, 365 * 100);

        // Save user info
        await getUserInfo();

        return true;
    };

    const logout = () => {
        token.current = null;
        user.current = null;

        clearCookies(APP_NAME);
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
        const postData = { password, email: newEmail.toLowerCase() };

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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

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
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/fast/setFastDesiredStartTime`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

            return response;
        } catch (error) {
            return { error: `Set fast desired start time error: ${error}` };
        }
    };

    const setFastObjective = async (fastObjectiveInMinutes) => {
        const postData = { fastObjectiveInMinutes };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/fast/setFastObjective`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

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
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/fast/startFasting`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

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
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/fast/stopFasting`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

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
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/fast/useWeeklyPass`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

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
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/fast/getMonthFastEntries`, {
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

            if ("fastHistoric" in response) {
                // Update local data
                if (!(year in fastHistoric.current)) fastHistoric.current[year] = {};
                fastHistoric.current[year][month] = response.fastHistoric;
                return true;
            }

            return false;
        } catch (error) {
            return { error: `Get month fast entries error: ${error}` };
        }
    };

    // #################################################
    //   HEALTH API
    // #################################################

    const setHeight = async (heightInCm) => {
        const postData = { heightInCm };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/health/setHeight`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

            return response;
        } catch (error) {
            return { error: `Set fast objective error: ${error}` };
        }
    };

    const setWeight = async (weightInKg) => {
        const date = new Date();
        const timezoneOffsetInMs = -date.getTimezoneOffset() * 60 * 1000;

        const postData = { weightInKg, date, timezoneOffsetInMs };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/health/setWeight`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

            return response;
        } catch (error) {
            return { error: `Set fast objective error: ${error}` };
        }
    };

    const setWeightObjective = async (weightObjectiveInKg) => {
        const postData = { weightObjectiveInKg };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/health/setWeightObjective`, {
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

            // Save new user
            if ("error" in response) return response;
            user.current = response;

            return response;
        } catch (error) {
            return { error: `Set fast objective error: ${error}` };
        }
    };

    const getWeightHistoric = async () => {
        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/health/getWeightHistoric`, {
                method: "get",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
            });

            const response = await rawResponse.json();

            // Return with error if it is the case
            if ("error" in response) return response;

            // Update local data
            if ("weightHistoric" in response) {
                weightHistoric.current = response.weightHistoric;
                return true;
            }

            return response;
        } catch (error) {
            return { error: `Get user info error: ${error}` };
        }
    };

    // #################################################
    //   PUSH API
    // #################################################

    const subscribeToPuhsNotifications = async () => {
        if (!("serviceWorker" in navigator)) return;

        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/push/subscribe`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(subscription),
            });

            const response = await rawResponse.json();

            return response;
        } catch (error) {
            return { error: `Set fast objective error: ${error}` };
        }
    };

    // #################################################
    //   VALIDATE API
    // #################################################

    const isEmailValid = async (email, checkIfExists) => {
        const postData = { email: email.toLowerCase(), checkIfExists };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isEmailValid`, {
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
            return { error: `Is valid email error: ${error}` };
        }
    };

    const isUsernameValid = async (username) => {
        const postData = { username };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isUsernameValid`, {
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
            return { error: `Is valid username error: ${error}` };
        }
    };

    const isPasswordValid = async (password) => {
        const postData = { password };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isPasswordValid`, {
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
            return { error: `Is valid password error: ${error}` };
        }
    };

    const isFastDesiredStartTimeValid = async (fastDesiredStartTimeInMinutes) => {
        const postData = { fastDesiredStartTimeInMinutes };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isFastDesiredStartTimeValid`, {
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
            return { error: `Is valid fast desired start time error: ${error}` };
        }
    };

    const isFastObjectiveValid = async (fastObjectiveInMinutes) => {
        const postData = { fastObjectiveInMinutes };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isFastObjectiveValid`, {
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
            return { error: `Is valid fast objective error: ${error}` };
        }
    };

    const isHeightValid = async (heightInCm) => {
        const postData = { heightInCm };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isHeightValid`, {
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
            return { error: `Is valid height error: ${error}` };
        }
    };

    const isWeightValid = async (weightInKg) => {
        const postData = { weightInKg };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isWeightValid`, {
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
            return { error: `Is valid weight error: ${error}` };
        }
    };

    const isWeightObjectiveValid = async (weightInKg, weightObjectiveInKg) => {
        const postData = { weightInKg, weightObjectiveInKg };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/validate/isWeightObjectiveValid`, {
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
            return { error: `Is valid weight objective error: ${error}` };
        }
    };

    return (
        <API.Provider
            value={{
                // AUTH API
                register,
                login,
                isLoggedIn,
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

                // HEALTH API
                setHeight,
                setWeight,
                setWeightObjective,
                getWeightHistoric,

                // PUSH API
                subscribeToPuhsNotifications,

                // VALIDATE API
                isEmailValid,
                isUsernameValid,
                isPasswordValid,
                isFastDesiredStartTimeValid,
                isFastObjectiveValid,
                isHeightValid,
                isWeightValid,
                isWeightObjectiveValid,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;

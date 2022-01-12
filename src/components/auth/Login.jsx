import { useState, useCallback, useRef, useEffect, useContext } from "react";
import useCssOneTimeAnimation from "../../hooks/useCssOneTimeAnimation";

const STAGES = ["login", "loginSuccess"];

const CARDS = {
    login: [
        {
            title: "Log in",
            subtitle: "Enter your email:",
            interactibles: [{ type: "input", inputType: "email", action: "loginEnterEmail" }],
        },
        {
            title: "Log in",
            subtitle: "Enter your password:",
            interactibles: [{ type: "input", inputType: "password", action: "loginEnterPassword" }],
        },
    ],
    loginSuccess: [
        {
            title: "Welcome back!",
            subtitle: "",
            interactibles: [{ type: "auto", action: "loginSuccess" }],
        },
    ],
};

export default function Login() {
    return <div></div>;
}

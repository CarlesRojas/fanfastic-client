import { useState, useCallback, useRef, useEffect, useContext } from "react";
import useCssOneTimeAnimation from "../../hooks/useCssOneTimeAnimation";
import Cards from "./Cards";

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
    // #################################################
    //   STATE
    // #################################################

    const [animating, trigger] = useCssOneTimeAnimation(400);
    const [stagesVisible, setStagesVisible] = useState(STAGES.map((_, i) => i === 0));

    const updateStagesVisible = (index, newValue) => {
        setStagesVisible((prev) => {
            const newArray = [...prev];
            newArray[index] = newValue;
            return newArray;
        });
    };

    return <div></div>;
}

import { useCallback, useEffect, useContext, useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import { Events } from "../../contexts/Events";
import Card from "./Card";

const STAGES = ["register", "fast", "health", "registerSuccess"];

const CARDS = {
    register: [
        {
            title: "Create an account",
            subtitle: "Enter your email:",
            interactibles: [{ type: "input", inputType: "email", action: "email" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new username:",
            interactibles: [{ type: "input", inputType: "text", action: "username" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new password:",
            interactibles: [{ type: "input", inputType: "password", action: "password" }],
        },
    ],
    fast: [
        {
            title: "Setup you fasting schedule",
            subtitle: "For how long do you want to fast?",
            interactibles: [
                { type: "picker", action: "pickfastDuration", pickerType: "fastDuration" },
                { type: "button", action: "fastDuration", content: "Select" },
            ],
        },
        {
            title: "Setup you fasting schedule",
            subtitle: "And at what time would you like to start?",
            interactibles: [
                { type: "picker", action: "pickfastStartTime", pickerType: "fastStartTime" },
                { type: "button", action: "fastStartTime", content: "Select" },
            ],
        },
    ],
    health: [
        {
            title: "Tell us about you",
            subtitle: "What is you height?",
            interactibles: [
                { type: "picker", action: "pickHeight", pickerType: "height" },
                { type: "button", action: "height", content: "Select" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "What is you weight?",
            interactibles: [
                { type: "picker", action: "pickWeight", pickerType: "weight" },
                { type: "button", action: "weight", content: "Select" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "And, what is you weight?",
            interactibles: [
                { type: "picker", action: "pickObjectiveWeight", pickerType: "objectiveWeight" },
                { type: "button", action: "objectiveWeight", content: "Select" },
            ],
        },
    ],
    registerSuccess: [
        {
            title: "All done!",
            subtitle: "Welcome to Fanfastic!",
            interactibles: [],
            auto: true,
        },
    ],
};

export default function Register() {
    const { sub, unsub } = useContext(Events);

    // #################################################
    //   DATA
    // #################################################

    const registrationData = useRef({
        email: "",
        username: "",
        password: "",
        fastDuration: "",
        fastStartTime: "",
        heigth: "",
        weight: "",
        objectiveWeight: "",
    });

    const handleActionDone = ({ stageId, action, data }) => {
        console.log(stageId, action, data);
        if (stageId === "register" && action in registrationData.current) registrationData.current[action] = data;
    };

    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const animationSpeed = 400;
    const content = STAGES.map((id) => (
        <Card
            cardPhases={CARDS[id]}
            stageId={id}
            canGoBack={id !== "registerSuccess"}
            registrationData={registrationData}
        />
    ));
    const [renderedPages, nextPage, prevPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "verticalPages",
        animationSpeed,
        animateFirst: true,
    });

    // #################################################
    //   NEXT & PREV
    // #################################################

    const handleNextStage = useCallback(() => {
        let timeout = null;

        if (!nextPage()) {
            timeout = setTimeout(() => {
                console.log("CALL ALL THE REGISTER APIS");
                console.log(registrationData.current);
            }, animationSpeed);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [nextPage]);

    const handlePrevStage = useCallback(() => {
        let timeout = null;

        if (!prevPage()) {
            timeout = setTimeout(() => {
                console.log("back to welcome");
            }, animationSpeed);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [prevPage]);

    useEffect(() => {
        sub("onNextStage", handleNextStage);
        sub("onActionDone", handleActionDone);
        sub("onPrevStage", handlePrevStage);

        return () => {
            unsub("onNextStage", handleNextStage);
            unsub("onActionDone", handleActionDone);
            unsub("onPrevStage", handlePrevStage);
        };
    }, [handleNextStage, handlePrevStage, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return renderedPages;
}

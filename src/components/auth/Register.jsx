import { useCallback, useEffect, useContext } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import { Events } from "../../contexts/Events";
import Cards from "./Cards";

const STAGES = ["register", "fast", "health", "registerSuccess"];

const CARDS = {
    register: [
        {
            title: "Create an account",
            subtitle: "Enter your email:",
            interactibles: [{ type: "input", inputType: "email", action: "registerEnterEmail" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new username:",
            interactibles: [{ type: "input", inputType: "text", action: "registerEnterUsername" }],
        },
        {
            title: "Create an account",
            subtitle: "Enter your new password:",
            interactibles: [{ type: "input", inputType: "password", action: "registerEnterPassword" }],
        },
    ],
    fast: [
        {
            title: "Setup you fasting schedule",
            subtitle: "For how long do you want to fast?",
            interactibles: [
                { type: "picker", action: "fastDuration" },
                { type: "button", content: "Select", action: "selectFastDuration" },
            ],
        },
        {
            title: "Setup you fasting schedule",
            subtitle: "And at what time would you like to start?",
            interactibles: [
                { type: "picker", action: "fastStartTime" },
                { type: "button", content: "Select", action: "selectFastStartTime" },
            ],
        },
    ],
    health: [
        {
            title: "Tell us about you",
            subtitle: "What is you height?",
            interactibles: [
                { type: "picker", action: "height" },
                { type: "button", content: "Select", action: "selectHeight" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "What is you weight?",
            interactibles: [
                { type: "picker", action: "weight" },
                { type: "button", content: "Select", action: "selectWeight" },
            ],
        },
        {
            title: "Tell us about you",
            subtitle: "And, what is you weight?",
            interactibles: [
                { type: "picker", action: "objectiveWeight" },
                { type: "button", content: "Select", action: "selectObjectiveWeight" },
            ],
        },
    ],
    registerSuccess: [
        {
            title: "All done!",
            subtitle: "Welcome to Fanfastic!",
            interactibles: [{ type: "auto", action: "registerSuccess" }],
        },
    ],
};

export default function Register() {
    const { sub, unsub } = useContext(Events);

    const content = STAGES.map((id, i) => <Cards cards={CARDS[id]} stageId={id} />);

    const [renderedPages, nextPage, prevPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "verticalPages",
    });

    const handleNextStage = useCallback(
        (data) => {
            console.log(data);
            if (!nextPage()) console.log("End Register");
        },
        [nextPage]
    );

    const handlePrevStage = useCallback(
        (data) => {
            console.log(data);
            if (!prevPage()) console.log("back to welcome");
        },
        [prevPage]
    );

    useEffect(() => {
        sub("onNextStage", handleNextStage);
        sub("onPrevStage", handlePrevStage);

        return () => {
            unsub("onNextStage", handleNextStage);
            unsub("onPrevStage", handlePrevStage);
        };
    }, [handleNextStage, handlePrevStage, sub, unsub]);

    return renderedPages;
}

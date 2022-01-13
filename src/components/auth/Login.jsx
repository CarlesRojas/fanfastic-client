import { useCallback, useEffect, useContext, useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import { Events } from "../../contexts/Events";
import Card from "./Card";

const PARENT_ID = "login";
const STAGES = ["login", "loginSuccess"];

const CARDS = {
    login: [
        {
            title: "Log in",
            subtitle: "Enter your email:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", action: "email", inputType: "email" }],
        },
        {
            title: "Log in",
            subtitle: "Enter your password:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", action: "password", inputType: "password" }],
        },
    ],
    loginSuccess: [
        {
            title: "Welcome back",
            subtitle: "Happy to see you again!",
            interactiblesHeight: 0,
            interactibles: [],
            auto: true,
        },
    ],
};

export default function Login({ parentId }) {
    const { sub, unsub, emit } = useContext(Events);

    // #################################################
    //   DATA
    // #################################################

    const loginData = useRef({
        email: "",
        password: "",
    });

    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const animationSpeed = 400;
    const content = STAGES.map((id) => (
        <Card cardPhases={CARDS[id]} canGoBack={id !== "loginSuccess"} parentData={loginData} parentId={PARENT_ID} />
    ));
    const [renderedPages, nextPage, prevPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "lateralPages",
        animationSpeed,
        animateFirst: true,
    });

    // #################################################
    //   HANDLERS
    // #################################################

    const handleActionDone = useCallback(
        ({ callerParentId, action, data }) => {
            if (callerParentId !== PARENT_ID) return;

            if (action in loginData.current) loginData.current[action] = data;

            if (action === "password") {
                console.log("CALL ALL THE LOGIN APIS");
                console.log(loginData.current);

                // ROJAS REMOVE TIMEOUT and just wait for the api to response to decide to go to next or to show error
                setTimeout(() => {
                    nextPage();
                }, 2000);
            }
        },
        [nextPage]
    );

    const handleNextStage = useCallback(
        (callerParentId) => {
            if (callerParentId !== PARENT_ID) return;
            nextPage();
        },
        [nextPage]
    );

    const handlePrevStage = useCallback(
        (callerParentId) => {
            if (callerParentId !== PARENT_ID) return;
            if (!prevPage()) emit("onPrevStage", parentId);
        },
        [prevPage, emit, parentId]
    );

    // #################################################
    //   EVENTS
    // #################################################

    useEffect(() => {
        sub("onNextStage", handleNextStage);
        sub("onPrevStage", handlePrevStage);
        sub("onActionDone", handleActionDone);

        return () => {
            unsub("onNextStage", handleNextStage);
            unsub("onPrevStage", handlePrevStage);
            unsub("onActionDone", handleActionDone);
        };
    }, [handleNextStage, handlePrevStage, handleActionDone, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return renderedPages;
}

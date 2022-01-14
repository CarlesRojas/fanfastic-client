import { useCallback, useEffect, useContext, useRef } from "react";
import usePageAnimation from "../../hooks/usePageAnimation";
import Card from "./Card";

import { Events } from "../../contexts/Events";
import { API } from "../../contexts/API";

const PARENT_ID = "login";
const STAGES = ["login"];

const CARDS = {
    login: [
        {
            title: "Log in",
            subtitle: "Enter your email:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", inputType: "email", checkExists: false }],
        },
        {
            title: "Log in",
            subtitle: "Enter your password:",
            interactiblesHeight: 4,
            interactibles: [{ type: "input", action: "completeLogin", inputType: "password" }],
        },
    ],
};

export default function Login({ parentId, setLoggedIn }) {
    const { sub, unsub, emit } = useContext(Events);
    const { login } = useContext(API);

    // #################################################
    //   LOGIN
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
        <Card cardPhases={CARDS[id]} canGoBack={true} parentData={loginData} parentId={PARENT_ID} />
    ));
    const [renderedPages, nextPage, prevPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "lateralPages",
        animationSpeed,
        animateFirst: true,
        initialPage: 0,
    });

    // #################################################
    //   HANDLERS
    // #################################################

    const handleLogin = useCallback(async () => {
        const result = await login(loginData.current.email, loginData.current.password);

        if ("error" in result) emit("onLoginError", result.error);
        else {
            nextPage();
            setTimeout(() => setLoggedIn(true), animationSpeed);
        }
    }, [login, nextPage, setLoggedIn, emit]);

    const handleActionDone = useCallback(
        ({ callerParentId, action }) => {
            if (callerParentId !== PARENT_ID) return;
            if (action === "completeLogin") handleLogin();
        },
        [handleLogin]
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

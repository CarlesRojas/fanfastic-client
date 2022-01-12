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
            interactibles: [{ type: "input", action: "email", inputType: "email" }],
        },
        {
            title: "Log in",
            subtitle: "Enter your password:",
            interactibles: [{ type: "input", action: "password", inputType: "password" }],
        },
    ],
    loginSuccess: [
        {
            title: "Welcome back",
            subtitle: "Happy to see you again!",
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

    const handleActionDone = ({ stageId, action, data }) => {
        if (stageId !== PARENT_ID) return;

        if (action in loginData.current) loginData.current[action] = data;
    };

    // #################################################
    //   PAGE ANIMATION
    // #################################################

    const animationSpeed = 400;
    const content = STAGES.map((id) => (
        <Card
            cardPhases={CARDS[id]}
            stageId={id}
            canGoBack={id !== "loginSuccess"}
            parentData={loginData}
            parentId={PARENT_ID}
        />
    ));
    const [renderedPages, nextPage, prevPage] = usePageAnimation({
        pagesIds: STAGES,
        pagesContents: content,
        containerClass: "lateralPages",
        animationSpeed,
        animateFirst: true,
    });

    // #################################################
    //   NEXT & PREV
    // #################################################

    const handleNextStage = useCallback(
        (stageId) => {
            if (stageId !== PARENT_ID) return;
            let timeout = null;

            if (!nextPage()) {
                timeout = setTimeout(() => {
                    console.log("CALL ALL THE LOGIN APIS");
                    console.log(loginData.current);
                }, animationSpeed);
            }

            return () => {
                clearTimeout(timeout);
            };
        },
        [nextPage]
    );

    const handlePrevStage = useCallback(
        (stageId) => {
            if (stageId !== PARENT_ID) return;
            if (!prevPage()) emit("onPrevStage", parentId);
        },
        [prevPage, emit, parentId]
    );

    useEffect(() => {
        sub("onNextStage", handleNextStage);
        sub("onPrevStage", handlePrevStage);
        sub("onActionDone", handleActionDone);

        return () => {
            unsub("onNextStage", handleNextStage);
            unsub("onPrevStage", handlePrevStage);
            unsub("onActionDone", handleActionDone);
        };
    }, [handleNextStage, handlePrevStage, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return renderedPages;
}

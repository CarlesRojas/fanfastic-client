import { useContext, useRef, useEffect, useCallback } from "react";

import { Events } from "../../contexts/Events";
import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

import Card from "../auth/Card";

const PARENT_ID = "deleteAccountPopup";
const PHASES = [
    {
        title: "Delete you account",
        subtitle: "All your historic data will also be deleted. Enter your password to confirm:",
        interactiblesHeight: 4,
        interactibles: [{ type: "input", inputType: "password", action: "complete" }],
    },
];

export default function DeleteAccountPopup() {
    const { sub, unsub, emit } = useContext(Events);
    const { deleteAccount } = useContext(API);
    const { set, get } = useContext(GlobalState);

    // #################################################
    //   STATE
    // #################################################

    const data = useRef({ password: "" });

    // #################################################
    //   HANDLERS
    // #################################################

    const checkError = useCallback(
        (data) => {
            if ("error" in data) {
                emit("onRegisterError", data.error);
                return true;
            }
            return false;
        },
        [emit]
    );

    const handleActionDone = useCallback(
        async ({ callerParentId, action }) => {
            if (callerParentId !== PARENT_ID) return;

            const { password } = data.current;

            if (action === "complete") {
                const result = await deleteAccount(password);
                if (checkError(result)) return;

                set("showPopup", { ...get("showPopup"), visible: false });
            }
        },
        [deleteAccount, checkError, set, get]
    );

    // #################################################
    //   EVENTS
    // #################################################

    useEffect(() => {
        sub("onActionDone", handleActionDone);

        return () => {
            unsub("onActionDone", handleActionDone);
        };
    }, [handleActionDone, sub, unsub]);

    // #################################################
    //   RENDER
    // #################################################

    return <Card cardPhases={PHASES} canGoBack={false} parentData={data} parentId={PARENT_ID} hideClip={true} />;
}

import { useContext } from "react";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

export default function LogoutPopup() {
    const { logout } = useContext(API);
    const { set, get } = useContext(GlobalState);

    // #################################################
    //   HANDLERS
    // #################################################

    const handleConfirmClick = useThrottle(async () => {
        set("showPopup", { ...get("showPopup"), visible: false });
        await logout();
    }, 1500);

    const handleCancelClick = () => {
        set("showPopup", { ...get("showPopup"), visible: false });
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="PopupContent">
            <h1>{"Whant to log out?"}</h1>

            <div className="separation"></div>
            <Button data={{ content: "Log Out" }} nextPhase={handleConfirmClick} />

            <div className="separation"></div>
            <Button data={{ content: "Cancel" }} low={true} nextPhase={handleCancelClick} isLastInteractible={true} />
        </div>
    );
}

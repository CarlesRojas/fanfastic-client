import { useContext, useState } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function UnsubNotificationsPopup() {
    const { unsubscribeFromPushNotifications } = useContext(API);
    const { set, get } = useContext(GlobalState);

    // #################################################
    //   STATE
    // #################################################

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // #################################################
    //   HANDLERS
    // #################################################

    const checkError = (data) => {
        if ("error" in data) {
            setError(data.error);
            return true;
        }
        return false;
    };

    const handleConfirmClick = useThrottle(async () => {
        setLoading(true);

        const result = await unsubscribeFromPushNotifications();
        setLoading(false);
        if (checkError(result)) return;

        set("showPopup", { ...get("showPopup"), visible: false });
    }, 1500);

    const handleCancelClick = () => {
        set("showPopup", { ...get("showPopup"), visible: false });
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="PopupContent">
            <h1>{"Stop Notifications"}</h1>
            <div className={"subtitle"}>
                {"You will no longer recieve notifications on any device."}
                <p className={cn({ visible: error })}>{error || "Error"}</p>
            </div>

            <div className={"loadingContainer"}>
                <SVG className={cn("loadingIcon", "spin", "infinite", { visible: loading })} src={LoadingIcon} />
            </div>

            <div className="separation"></div>
            <Button data={{ content: "Stop notifications" }} nextPhase={handleConfirmClick} />

            <div className="separation"></div>
            <Button data={{ content: "Cancel" }} low={true} nextPhase={handleCancelClick} isLastInteractible={true} />
        </div>
    );
}

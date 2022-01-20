import { useContext, useState } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";
import { Data } from "../../contexts/Data";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function UseWeeklyPassPopup() {
    const { useWeeklyPass } = useContext(API);
    const { set, get } = useContext(GlobalState);
    const { user } = useContext(Data);

    const { isFasting } = user.current;

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

        // eslint-disable-next-line
        const result = await useWeeklyPass();
        setLoading(false);
        if (checkError(result)) return;

        set("showPopup", { ...get("showPopup"), visible: false });
    }, 2000);

    const handleCancelClick = () => {
        set("showPopup", { ...get("showPopup"), visible: false });
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="PopupContent">
            <h1>{isFasting ? "Cancel fasting session?" : "Skip fasting session?"}</h1>
            <div className={"subtitle"}>
                {"You can do this once a week without breaking your streak."}
                <p className={cn({ visible: error })}>{error || "Error"}</p>
            </div>
            <div className={"loadingContainer"}>
                <SVG className={cn("loadingIcon", "spin", "infinite", { visible: loading })} src={LoadingIcon} />
            </div>

            <div className="separation"></div>
            <Button
                data={{ content: isFasting ? "Cancel fasting session" : "Skip fasting session" }}
                nextPhase={handleConfirmClick}
            />

            <div className="separation"></div>
            <Button
                data={{ content: isFasting ? "Continue fasting" : "Cancel" }}
                low={true}
                nextPhase={handleCancelClick}
                isLastInteractible={true}
            />
        </div>
    );
}

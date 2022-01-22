import { useContext, useState, useRef } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import HeightPicker from "../auth/HeightPicker";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { Data } from "../../contexts/Data";
import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function UpdateHeightPopup() {
    const { user } = useContext(Data);
    const { setHeight } = useContext(API);
    const { set, get } = useContext(GlobalState);

    const { heightInCm } = user.current;

    // #################################################
    //   STATE
    // #################################################

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const data = useRef({ height: { m: Math.floor(heightInCm / 100), cm: heightInCm % 100 } });

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
        const { height } = data.current;
        setLoading(true);

        const result = await setHeight(height.m * 100 + height.cm);
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
            <h1>{"Enter your current height"}</h1>
            <div className={"subtitle"}>
                <p className={cn({ visible: error })}>{error || "Error"}</p>
            </div>

            <div className={"loadingContainer"}>
                <SVG className={cn("loadingIcon", "spin", "infinite", { visible: loading })} src={LoadingIcon} />
            </div>

            <HeightPicker data={{ pickerType: "height" }} parentData={data} />

            <div className="separation"></div>
            <Button data={{ content: "Update Height" }} nextPhase={handleConfirmClick} />

            <div className="separation"></div>
            <Button data={{ content: "Cancel" }} low={true} nextPhase={handleCancelClick} isLastInteractible={true} />
        </div>
    );
}

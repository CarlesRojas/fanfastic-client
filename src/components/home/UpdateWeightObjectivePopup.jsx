import { useContext, useState, useRef } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";
import WeightPicker from "../auth/WeightPicker";
import Button from "../auth/Button";
import useThrottle from "../../hooks/useThrottle";

import { Data } from "../../contexts/Data";
import { API } from "../../contexts/API";
import { GlobalState } from "../../contexts/GlobalState";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function UpdateWeightObjectivePopup() {
    const { user } = useContext(Data);
    const { setWeightObjective } = useContext(API);
    const { set, get } = useContext(GlobalState);

    const { weightInKg } = user.current;

    // #################################################
    //   STATE
    // #################################################

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const data = useRef({
        weight: { kg: Math.floor(weightInKg), dg: Math.floor((weightInKg % 1) * 10) },
        objectiveWeight: { kg: 80, dg: 0 },
    });

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
        const { objectiveWeight } = data.current;
        setLoading(true);

        const setWeightResult = await setWeightObjective(objectiveWeight.kg + objectiveWeight.dg / 10);
        setLoading(false);
        if (checkError(setWeightResult)) return;

        set("showPopup", { ...get("showPopup"), visible: false });
    }, 1500);

    const handleSkip = () => {
        set("showPopup", { ...get("showPopup"), visible: false });
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="PopupContent">
            <h1>{"What weight would you like to have?"}</h1>
            <div className={"subtitle"}>
                <p className={cn({ visible: error })}>{error || "Error"}</p>
            </div>
            <div className={"loadingContainer"}>
                <SVG className={cn("loadingIcon", "spin", "infinite", { visible: loading })} src={LoadingIcon} />
            </div>

            <WeightPicker data={{ pickerType: "objectiveWeight" }} parentData={data} />

            <div className="separation"></div>
            <Button data={{ content: "Set new objective weight" }} nextPhase={handleConfirmClick} />

            <div className="separation"></div>
            <Button
                data={{ content: "Don't set and objective weight" }}
                low={true}
                nextPhase={handleSkip}
                isLastInteractible={true}
            />
        </div>
    );
}

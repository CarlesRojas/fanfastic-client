import { useContext } from "react";
import WeightSection from "./WeightSection";

import { Data } from "../../contexts/Data";

export default function Weight() {
    const { user } = useContext(Data);
    const { weightObjectiveInKg } = user.current;

    return (
        <div className="Weight">
            <h1>{weightObjectiveInKg < 0 ? "Your weight" : "Weight Progress"}</h1>

            <div className="fastingContainer">
                <WeightSection />
            </div>
        </div>
    );
}

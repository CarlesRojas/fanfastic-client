import { useContext } from "react";
import FastingSection from "./FastingSection";

import { Data } from "../../contexts/Data";
import WeightSection from "../weight/WeightSection";

export default function FastingWeight() {
    const { user } = useContext(Data);
    const { isFasting } = user.current;

    return (
        <div className="Fasting">
            <h1>{isFasting ? "Fasting" : "Breaking fast"}</h1>

            <div className="bigSectionContainer">
                <FastingSection />

                <WeightSection />
            </div>
        </div>
    );
}

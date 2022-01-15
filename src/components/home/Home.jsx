import { useContext } from "react";
import FastingSection from "./FastingSection";
import NotFastingSection from "./NotFastingSection";
import WeightSection from "./WeightSection";
import useGlobalState from "../../hooks/useGlobalState";

import { Data } from "../../contexts/Data";

export default function Home() {
    const { user } = useContext(Data);

    // eslint-disable-next-line
    const [updatedTimes] = useGlobalState("userUpdated");

    return (
        <div className="Home">
            {user.current.isFasting && <FastingSection />}
            {!user.current.isFasting && <NotFastingSection />}
            <WeightSection />
        </div>
    );
}

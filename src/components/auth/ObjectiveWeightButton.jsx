import cn from "classnames";

export default function ObjectiveWeightButton({ nextPhase, isLastInteractible, parentData }) {
    // #################################################
    //   HANDLERS
    // #################################################

    const handleSkip = () => {
        parentData.current.objectiveWeight = { kg: -1, dg: -1 };
        nextPhase();
    };

    const handleSelect = () => {
        nextPhase();
    };

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("ObjectiveWeightButton", { last: isLastInteractible })}>
            <div className="skip" onClick={handleSkip}>
                Skip
            </div>
            <div className="select" onClick={handleSelect}>
                Select
            </div>
        </div>
    );
}

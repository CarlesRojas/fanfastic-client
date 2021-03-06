import cn from "classnames";

export default function Button({ data, nextPhase, isLastInteractible, low }) {
    const { content } = data;

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("Button", { last: isLastInteractible }, { low })} onClick={nextPhase}>
            {content}
        </div>
    );
}

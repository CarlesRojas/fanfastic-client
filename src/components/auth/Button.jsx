import cn from "classnames";

export default function Button({ data, nextPhase, isLastInteractible }) {
    const { content } = data;

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className={cn("Button", { last: isLastInteractible })} onClick={nextPhase}>
            {content}
        </div>
    );
}

import cn from "classnames";

export default function Button({ data, handleAction, last }) {
    const { content } = data;

    return (
        <div className={cn("Button", { last })} onClick={handleAction}>
            {content}
        </div>
    );
}

import cn from "classnames";

export default function Button({ data, nextCard, last }) {
    const { content } = data;

    return (
        <div className={cn("Button", { last })} onClick={nextCard}>
            {content}
        </div>
    );
}

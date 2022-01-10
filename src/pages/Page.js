import cn from "classnames";
import { useTransition, animated } from "react-spring";
import React from "react";

export default function Page({ children, visible }) {
    const backgroundTransition = useTransition(visible, {
        from: { opacity: "0" },
        enter: { opacity: "1", delay: 300 },
        leave: { opacity: "0" },
        reverse: visible,
    });

    return backgroundTransition(
        (styles, item) =>
            item && (
                <animated.div className={cn("Page", { visible })} style={styles}>
                    {children}
                </animated.div>
            )
    );
}

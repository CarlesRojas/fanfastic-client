import React from "react";
import cn from "classnames";
import { useTransition, animated } from "react-spring";
import useGlobalState from "../../hooks/useGlobalState";

export default function Popup() {
    const [information, setInformation] = useGlobalState("showPopup");

    const { visible, canClose, content, addPadding } = information;

    // #################################################
    //   TRANSITIONS
    // #################################################

    const blurTransition = useTransition(visible, {
        from: { backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(10px) opacity(0)" },
        enter: { backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(10px) opacity(1)" },
        leave: { backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(10px) opacity(0)" },
        reverse: visible,
    });

    const contentTransition = useTransition(visible, {
        from: { translateY: "100vh" },
        enter: { translateY: "0vh" },
        leave: { translateY: "100vh" },
        reverse: visible,
    });

    // #################################################
    //   CLOSE
    // #################################################

    return (
        <div className="Popup">
            {blurTransition(
                (styles, item) =>
                    item && (
                        <animated.div
                            className="blur"
                            style={styles}
                            onClick={() => canClose && setInformation({ ...information, visible: false })}
                        ></animated.div>
                    )
            )}
            {contentTransition(
                (styles, item) =>
                    item && (
                        <animated.div className={cn("contentContainer", { addPadding })} style={styles}>
                            {content}
                            {canClose && (
                                <div
                                    className="button"
                                    onClick={() => setInformation({ ...information, visible: false })}
                                >
                                    Close
                                </div>
                            )}
                        </animated.div>
                    )
            )}
        </div>
    );
}

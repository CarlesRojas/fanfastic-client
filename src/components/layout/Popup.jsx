import React from "react";
import { useTransition, animated } from "react-spring";
import useGlobalState from "../../hooks/useGlobalState";

export default function Popup() {
    const [visible, setVisible] = useGlobalState("showPopup");

    const { show, content } = visible;

    // #################################################
    //   TRANSITIONS
    // #################################################

    const blurTransition = useTransition(show, {
        from: { backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(10px) opacity(0)" },
        enter: { backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(10px) opacity(1)" },
        leave: { backgroundColor: "rgba(0, 0, 0, 0)", backdropFilter: "blur(10px) opacity(0)" },
        reverse: show,
    });

    const contentTransition = useTransition(show, {
        from: { translateY: "100vh" },
        enter: { translateY: "0vh" },
        leave: { translateY: "100vh" },
        reverse: show,
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
                            onClick={() => setVisible({ show: false, content: null })}
                        ></animated.div>
                    )
            )}
            {contentTransition(
                (styles, item) =>
                    item && (
                        <animated.div className="contentContainer" style={styles}>
                            {content}
                            <div className="button" onClick={() => setVisible({ show: false, content: null })}>
                                Close
                            </div>
                        </animated.div>
                    )
            )}
        </div>
    );
}

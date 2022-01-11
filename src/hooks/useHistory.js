import { useEffect, useContext, useRef } from "react";
import { Events } from "../contexts/Events";

export default function useHistory() {
    const { sub, unsub, emit } = useContext(Events);

    const currentPage = useRef([]);

    useEffect(() => {
        // Some component created what seems like a new page
        const handleNewPage = (data) => {
            console.log(`new page by ${data.component}`);
            currentPage.current.push({ ...data, origin: "browser" });
            window.history.pushState(data.page, data.page, "");
        };

        // When the app goes back, inform the browser
        const handleAppBack = () => {
            console.log(`app back`);

            window.history.back();
        };

        const handleBrowserBack = () => {
            console.log(`go back`);
            const data = currentPage.current.pop();

            if (data.origin === "browser") emit("onBrowserBackClicked", data);
        };

        sub("onNewPage", handleNewPage);
        sub("onAppBack", handleAppBack);
        window.addEventListener("popstate", handleBrowserBack);

        return () => {
            unsub("onNewPage", handleNewPage);
            unsub("onAppBack", handleAppBack);
            window.removeEventListener("popstate", handleBrowserBack);
        };
    }, [sub, unsub, emit]);
}

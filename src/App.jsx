import { useState } from "react";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Page from "./pages/Page";

export default function App() {
    const [page, setPage] = useState("auth");

    return (
        <div className="App">
            <Page visible={page === "auth"}>
                <Auth />
            </Page>

            <Page visible={page === "home"}>
                <Home />
            </Page>
            <div className="change" onClick={() => setPage((prev) => (prev === "auth" ? "home" : "auth"))}></div>
        </div>
    );
}

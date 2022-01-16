import { StrictMode } from "react";
import * as serviceWorker from "./serviceWorker";
import ReactDOM from "react-dom";
import App from "./App";
import Loading from "./components/layout/Loading";
import "./styles/main.scss";

// Contexts
import EventsProvider from "./contexts/Events";
import UtilsProvider from "./contexts/Utils";
import APIProvider from "./contexts/API";
import LanguageProvider from "./contexts/Language";
import GlobalStateProvider from "./contexts/GlobalState";
import DataProvider from "./contexts/Data";
import MediaQueryProvider from "./contexts/MediaQuery";

ReactDOM.render(
    <StrictMode>
        <EventsProvider>
            <UtilsProvider>
                <GlobalStateProvider>
                    <DataProvider>
                        <APIProvider>
                            <LanguageProvider>
                                <MediaQueryProvider>
                                    <App />
                                    <Loading />
                                </MediaQueryProvider>
                            </LanguageProvider>
                        </APIProvider>
                    </DataProvider>
                </GlobalStateProvider>
            </UtilsProvider>
        </EventsProvider>
    </StrictMode>,
    document.getElementById("root")
);

serviceWorker.register();

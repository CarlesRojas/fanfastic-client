import * as serviceWorker from "./serviceWorker";
import ReactDOM from "react-dom";
import App from "./App";
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
    <EventsProvider>
        <UtilsProvider>
            <APIProvider>
                <LanguageProvider>
                    <GlobalStateProvider>
                        <DataProvider>
                            <MediaQueryProvider>
                                <App />
                            </MediaQueryProvider>
                        </DataProvider>
                    </GlobalStateProvider>
                </LanguageProvider>
            </APIProvider>
        </UtilsProvider>
    </EventsProvider>,
    document.getElementById("root")
);

serviceWorker.unregister();

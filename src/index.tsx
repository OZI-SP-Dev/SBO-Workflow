import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "core-js/features/array/find";
import "core-js/features/array/includes";
import "core-js/features/number/is-nan";
import "core-js/features/string/replace-all";
import "core-js/features/string/replace";
import "core-js/stable/array/from";
import "core-js/stable/array/fill";
import "core-js/stable/array/iterator";
import "core-js/stable/promise";
import "core-js/stable/reflect";
import "es6-map/implement";
import "core-js/stable/symbol";
import "whatwg-fetch";
import "proxy-polyfill/proxy.min.js";
import "@pnp/polyfill-ie11";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import { OrgsProvider } from "./providers/OrgsContext";
import { initializeFileTypeIcons } from "@fluentui/react-file-type-icons";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/plugins/paste";
import "tinymce/plugins/link";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/charmap";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/paste";
import "tinymce/plugins/wordcount";
// Skins
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/ui/oxide/content.min.css";
import "tinymce/skins/content/default/content.min.css";
import { ErrorsProvider } from "./providers/ErrorsContext";
import { UserProvider } from "./providers/UserProvider";
import { ContactUsProvider } from "./providers/ContactUsContext";

initializeIcons();
initializeFileTypeIcons();

ReactDOM.render(
  <React.StrictMode>
    <ErrorsProvider>
      <UserProvider>
        <OrgsProvider>
          <ContactUsProvider>
            <App />
          </ContactUsProvider>
        </OrgsProvider>
      </UserProvider>
    </ErrorsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

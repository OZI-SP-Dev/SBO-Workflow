import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { initializeIcons } from '@uifabric/icons';
import { OrgsProvider } from './providers/OrgsContext';
import { initializeFileTypeIcons } from '@uifabric/file-type-icons';
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/wordcount';
// Skins
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/ui/oxide/content.min.css'
import 'tinymce/skins/content/default/content.min.css'
import { ErrorsProvider } from './providers/ErrorsContext';
import { UserProvider } from './providers/UserProvider';

initializeIcons();
initializeFileTypeIcons();

ReactDOM.render(
  <React.StrictMode>
    <ErrorsProvider>
      <UserProvider>
        <OrgsProvider>
          <App />
        </OrgsProvider>
      </UserProvider>
    </ErrorsProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

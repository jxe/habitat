import React from 'react';
import ReactDOM from 'react-dom';
import {Habitat} from './Habitat.jsx';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Habitat />, document.getElementById('root'));
registerServiceWorker();

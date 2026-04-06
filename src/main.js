import './index.css';
import { boot } from './app.js';
import { initDomBindings } from './domBindings.js';

document.addEventListener('DOMContentLoaded', boot);
document.addEventListener('DOMContentLoaded', initDomBindings);

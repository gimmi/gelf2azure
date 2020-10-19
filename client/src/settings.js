const ls = window.localStorage;
const settings = JSON.parse(ls.getItem('settings')) || {};

window.addEventListener('beforeunload', () => ls.setItem('settings', JSON.stringify(settings)));

export default settings;
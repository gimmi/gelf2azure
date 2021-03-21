const ls = window.localStorage;

export default {
    get(key, def) {
        const json = ls.getItem(key)
        return JSON.parse(json) || def;
    },

    set(key, val) {
        const json = JSON.stringify(val)
        ls.setItem(key, json)
    }
}
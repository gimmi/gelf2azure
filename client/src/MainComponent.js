import React from 'react';
import produce from 'immer'
import ConnectionOverlay from './ConnectionOverlay';
import Split from 'react-split'
import LogsComponent from './LogsComponent';
import storage from './storage';

export class MainComponent extends React.Component {
    constructor(props) {
        super(props);

        const categories = storage.get('categories', [])
        categories.forEach(x => x.count = 0)
        this.state = {
            connected: false,
            categories: categories,
            logs: []
        }

        this.logsStyle = {
            flex: '1 1 auto',
            padding: '.5em'
        }
    }

    componentDidMount() {
        this.ws = new WebSocket(`ws://${window.location.host}/ws`);
        this.ws.onopen = () => this.setState(produce(state => { state.connected = true }));
        this.ws.onclose = () => this.setState(produce(state => { state.connected = false }));
        this.ws.onerror = () => this.setState(produce(state => { state.connected = false }));
        this.ws.onmessage = message => this.onWsMessage(JSON.parse(message.data));
    }

    componentWillUnmount() {
        this.ws.close();
    }

    onWsMessage(message) {
        this.setState(produce(state => {
            const catName = `${message.host || 'unknown'}/${message.container_name || 'unknown'}`
            const text = message.log || 'unknown';
            const category = this.getOrAddCategory(state.categories, catName)

            category.count += 1

            if (category.selected) {
                const log = state.logs.length >= 500 ? state.logs.shift() : { key: state.logs.length }
                log.category = catName;
                log.text = text;
                state.logs.push(log);
            }
        }))
    }

    getOrAddCategory(cats, catName) {
        const newCat = { name: catName, count: 0, selected: true };

        for (let i = 0; i < cats.length; i++) {
            const curCat = cats[i]
            const cmp = catName.localeCompare(curCat.name)
            if (cmp === 0) {
                return curCat
            }

            if (cmp < 0) {
                cats.splice(i, 0, newCat);
                storage.set('categories', cats)
                return newCat
            }
        }

        cats.push(newCat)
        storage.set('categories', cats)
        return newCat
    }

    toggleCategory(catName) {
        this.setState(produce(state => {
            const cat = state.categories.find(x => x.name === catName);
            if (cat.selected) {
                cat.selected = false
            } else {
                cat.selected = true
            }

            storage.set('categories', state.categories)
        }))
    }

    render() {
        const categoriesStyle = {
            padding: '.5em',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 auto',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
        }

        const catEls = this.state.categories.map(cat => {
            const checkbox = <input type="checkbox" checked={cat.selected} onChange={() => this.toggleCategory(cat.name)} />
            return <li key={cat.name} className="highlight">{checkbox} {cat.count} {cat.name}</li>
        })

        return (
            <React.Fragment>
                <Split style={{ flexGrow: 1, display: 'flex', overflow: 'auto' }} sizes={storage.get('splitSizes', [10, 90])} onDragEnd={sizes => storage.set('splitSizes', sizes)}>
                    <ul style={categoriesStyle}>
                        {catEls}
                    </ul>
                    <LogsComponent style={this.logsStyle} logs={this.state.logs} />
                </Split>
                <ConnectionOverlay connected={this.state.connected} />
            </React.Fragment>
        );
    }
}

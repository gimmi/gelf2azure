import React from 'react';
import produce from 'immer'
import Split from 'react-split'
import LogsComponent from './LogsComponent';
import settings from './settings';

export class MainComponent extends React.Component {
    constructor(props) {
        super(props);

        settings.exclusions = new Set(settings.exclusions);
        this.state = {
            categories: {},
            logs: []
        };

        this.logsStyle = {
            flex: '1 1 auto',
            padding: '.5em'
        }
    }

    componentDidMount() {
        this.ws = new WebSocket(`ws://${window.location.host}/ws`);
        this.ws.onclose = e => {
            if (!e.wasClean) {
                console.error('Websocket dirty close', e);
            }
        }
        this.ws.onerror = e => console.error('Websocket error', e);
        this.ws.onmessage = message => this.onWsMessage(JSON.parse(message.data));
    }

    componentWillUnmount() {
        this.ws.close();
    }

    onWsMessage(message) {
        this.setState(produce(state => {
            const category = message.container_name || 'unknown';
            const text = message.log || 'unknown';

            if (state.categories[category]) {
                state.categories[category].count += 1
            } else {
                state.categories[category] = { count: 1, selected: !settings.exclusions.has(category) }
            }

            if (state.categories[category].selected) {
                const log = state.logs.length >= 500 ? state.logs.shift() : { key: state.logs.length }
                log.category = category;
                log.text = text;
                state.logs.push(log);
            }
        }))
    }

    toggleCategory(catName) {
        this.setState(produce(state => {
            const cat = state.categories[catName];
            if (cat.selected) {
                cat.selected = false
                settings.exclusions.add(catName)
            } else {
                cat.selected = true
                settings.exclusions.delete(catName)
            }
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

        const catEls = Object.keys(this.state.categories).map(key => {
            const val = this.state.categories[key]
            return <li key={key} className="highlight"><input type="checkbox" checked={val.selected} onChange={() => this.toggleCategory(key)} /> {val.count} {key}</li>
        });

        return (
            <Split style={{ flexGrow: 1, display: 'flex' }} sizes={settings.splitSizes || [10, 90]} onDragEnd={sizes => settings.splitSizes = sizes}>
                <ul style={categoriesStyle}>
                    {catEls}
                </ul>
                <LogsComponent style={this.logsStyle} logs={this.state.logs} />
            </Split>
        );
    }
}

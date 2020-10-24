import React from 'react';
import PropTypes from 'prop-types';

export default class LogsComponent extends React.Component {
    constructor(props) {
        super(props)

        this.logsRef = React.createRef()
    }

    componentDidUpdate() {
        // https://stackoverflow.com/a/33193694/66629
        const logsEl = this.logsRef.current
        logsEl.scrollTop = logsEl.scrollHeight - logsEl.clientHeight
    }

    render() {
        const logsStyle = Object.assign({
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            listStyleType: 'none',
            overflowY: 'scroll'
        }, this.props.style)

        const logEls = this.props.logs.map(l => <li key={l.key} className="highlight">{l.category}: {l.text}</li>)
        return (
            <ul style={logsStyle} ref={this.logsRef}>
                {logEls}
            </ul>
        )
    }
}

LogsComponent.propTypes = {
    style: PropTypes.object,
    logs: PropTypes.arrayOf(PropTypes.object).isRequired
}
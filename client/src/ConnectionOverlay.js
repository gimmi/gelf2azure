import React from 'react';
import PropTypes from 'prop-types';

export default function ConnectionOverlay(props) {
    const overlayStyle = {
        position: 'fixed',
        display: props.connected ? 'none' : 'block',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        zIndex: 2,
        cursor: 'pointer'
    }
    const textStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        fontSize: '2em',
        color: 'white',
        transform: 'translate(-50%,-50%)'
    }
    return (
        <div style={overlayStyle}>
            <div style={textStyle}>Disconnected, hit refresh</div>
        </div>
    )
}

ConnectionOverlay.propTypes = {
    connected: PropTypes.bool.isRequired
}

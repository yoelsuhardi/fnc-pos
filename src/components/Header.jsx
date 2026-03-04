import React, { useState, useEffect } from 'react';

export default function Header({ openPhoneQueue, openTransactions, openDailyClose, openSettings, onZoomIn, onZoomOut, onZoomReset, zoomLevel }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="pos-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="brand">FNC POS - PERTH</div>
                <button
                    onClick={openSettings}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', transition: 'color 0.2s' }}
                    title="Hardware Settings"
                >
                    ⚙️
                </button>
                <div className="zoom-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px', background: 'var(--panel-border)', padding: '4px 12px', borderRadius: '8px' }}>
                    <button onClick={onZoomOut} title="Zoom out (Ctrl+-)" style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0 8px' }}>🔍-</button>
                    <span
                        onClick={onZoomReset}
                        title="Reset zoom (Ctrl+0)"
                        style={{ fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', minWidth: '44px', textAlign: 'center' }}
                    >{Math.round((zoomLevel || 1) * 100)}%</span>
                    <button onClick={onZoomIn} title="Zoom in (Ctrl+=)" style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0 8px' }}>🔍+</button>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                    className="cart-type-btn"
                    style={{ background: 'var(--panel-border)', color: 'var(--text-main)', padding: '8px 14px', borderRadius: '8px', border: '1px solid #ccc' }}
                    onClick={openDailyClose}
                >
                    📊 Daily Close
                </button>
                <button
                    className="cart-type-btn"
                    style={{ background: 'var(--color-sides)', color: 'white', padding: '8px 14px', borderRadius: '8px', border: 'none' }}
                    onClick={openTransactions}
                >
                    🧾 Transactions
                </button>
                <button
                    className="cart-type-btn"
                    style={{ background: 'var(--color-specials)', color: 'white', padding: '8px 14px', borderRadius: '8px', border: 'none' }}
                    onClick={openPhoneQueue}
                >
                    💳 Phone Orders
                </button>
                <div className="clock">
                    {time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>
        </header>
    );
}

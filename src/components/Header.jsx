import React, { useState, useEffect } from 'react';

export default function Header({ openPhoneQueue, openTransactions, openSettings }) {
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
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button
                    className="cart-type-btn"
                    style={{ background: '#a3b18a', color: '#000', padding: '8px 16px', borderRadius: '8px' }}
                    onClick={openTransactions}
                >
                    📊 Daily Transactions
                </button>
                <button
                    className="cart-type-btn"
                    style={{ background: 'var(--color-specials)', color: 'white', padding: '8px 16px', borderRadius: '8px' }}
                    onClick={openPhoneQueue}
                >
                    💳 Pay Phone Orders
                </button>
                <div className="clock">
                    {time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>
        </header>
    );
}

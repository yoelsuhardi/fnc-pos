import React from 'react';
import { usePos } from '../context/PosContext';

export default function OrderTypePrompt() {
    const { isOrderStarted, setIsOrderStarted, setOrderType } = usePos();

    if (isOrderStarted) return null;

    const handleSelect = (type) => {
        setOrderType(type);
        setIsOrderStarted(true);
    };

    return (
        <div className="modal-overlay" style={{ background: 'rgba(241, 245, 249, 0.95)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
            <div style={{
                textAlign: 'center',
                padding: '60px',
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxWidth: '800px',
                width: '90%'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--text-main)' }}>New Order</h1>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '48px' }}>
                    Please select the order type to begin.
                </p>

                <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                    <button
                        onClick={() => handleSelect('walk-in')}
                        style={{
                            flex: 1,
                            padding: '40px 20px',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'var(--color-action)',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ fontSize: '4rem' }}>🚶</span>
                        Walk-In
                    </button>

                    <button
                        onClick={() => handleSelect('phone')}
                        style={{
                            flex: 1,
                            padding: '40px 20px',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'var(--color-chips)',
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(234, 88, 12, 0.3)',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ fontSize: '4rem' }}>☎️</span>
                        Phone Order
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';

export default function EftposModal({ amount, onSuccess, onCancel }) {
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        // Simulate terminal connection
        const timer1 = setTimeout(() => {
            setStatus('waiting');
        }, 1500);

        // Simulate customer card tap & approval
        const timer2 = setTimeout(() => {
            setStatus('approved');

            // Auto close and succeed after approval
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }, 4000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onSuccess]);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center' }}>
                <h2 className="modal-title">Smartpay EFTPOS</h2>

                <div style={{ fontSize: '3rem', fontWeight: '800', margin: '20px 0' }}>
                    ${amount.toFixed(2)}
                </div>

                {status === 'processing' && (
                    <div style={{ color: 'var(--color-action)', fontSize: '1.2rem' }}>
                        <span className="spinner">⌛</span> Sending to terminal...
                    </div>
                )}

                {status === 'waiting' && (
                    <div style={{ color: 'var(--color-action)', fontSize: '1.2rem' }}>
                        Please Ask Customer to Tap/Insert Card...
                    </div>
                )}

                {status === 'approved' && (
                    <div style={{ color: 'var(--color-success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ✅ APPROVED
                    </div>
                )}

                {status !== 'approved' && (
                    <div className="modal-actions" style={{ marginTop: '30px' }}>
                        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}

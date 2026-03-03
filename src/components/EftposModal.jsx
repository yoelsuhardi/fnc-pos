import React, { useState, useEffect, useRef } from 'react';
import { initiateTransaction, pollTransactionStatus } from '../services/SmartpayService';

export default function EftposModal({ amount, onSuccess, onCancel }) {
    const [status, setStatus] = useState('initiating'); // initiating, polling, approved, declined, error
    const [message, setMessage] = useState('Connecting to SmartConnect Cloud...');

    // Polling control
    const pollingRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const startTransaction = async () => {
            const isTest = localStorage.getItem('smartpay_env') !== 'prod';

            setStatus('initiating');
            setMessage('Sending transaction to terminal...');

            const result = await initiateTransaction(amount, 'Card.Purchase', isTest);

            if (!isMounted) return;

            if (result.success) {
                setStatus('polling');
                setMessage('Please Ask Customer to Tap/Insert/Swipe Card on Terminal.');
                startPolling(result.pollingUrl);
            } else {
                setStatus('error');
                setMessage(`Failed to send to terminal: ${result.error}`);
            }
        };

        const startPolling = (url) => {
            // Poll every 3 seconds
            pollingRef.current = setInterval(async () => {
                const pollResult = await pollTransactionStatus(url);

                if (!isMounted) return;

                if (pollResult.transactionStatus === 'COMPLETED') {
                    clearInterval(pollingRef.current);

                    if (pollResult.data && pollResult.data.TransactionResult === 'OK-ACCEPTED') {
                        setStatus('approved');
                        setMessage('✅ APPROVED');
                        setTimeout(() => {
                            if (isMounted) onSuccess();
                        }, 2000);
                    } else {
                        setStatus('declined');
                        setMessage(`❌ DECLINED: ${pollResult.data?.TransactionResult || 'Transaction Failed'}`);
                    }
                } else if (pollResult.transactionStatus === 'ERROR') {
                    clearInterval(pollingRef.current);
                    setStatus('error');
                    setMessage(`⚠️ ERROR: ${pollResult.error}`);
                }
                // If status is PENDING, keep polling

            }, 3000);
        };

        // If not paired, simulate for dev purposes, otherwise start real flow
        const isPaired = !!localStorage.getItem('smartpay_paired');

        if (!isPaired) {
            // Mock Flow if no terminal is paired
            setMessage('⚠️ No Terminal Paired. Simulating Success in 3s...');
            setStatus('polling');
            const timer = setTimeout(() => {
                if (isMounted) {
                    setStatus('approved');
                    setMessage('✅ SIMULATED APPROVAL');
                    setTimeout(() => isMounted && onSuccess(), 1500);
                }
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            startTransaction();
        }

        return () => {
            isMounted = false;
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [amount, onSuccess]);

    const handleCancel = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        onCancel();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <h2 className="modal-title" style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>SmartConnect EFTPOS</h2>

                <div style={{ fontSize: '3.5rem', fontWeight: '800', margin: '30px 0', color: status === 'declined' || status === 'error' ? '#f44336' : 'var(--text-main)' }}>
                    ${amount.toFixed(2)}
                </div>

                <div style={{ minHeight: '60px', marginBottom: '20px' }}>
                    {status === 'initiating' && (
                        <div style={{ color: 'var(--color-action)', fontSize: '1.2rem' }}>
                            <span className="spinner">⌛</span> {message}
                        </div>
                    )}

                    {status === 'polling' && (
                        <div style={{ color: 'var(--color-action)', fontSize: '1.1rem', padding: '0 20px', lineHeight: '1.5' }}>
                            <span className="spinner" style={{ display: 'block', fontSize: '2rem', marginBottom: '10px' }}>⌛</span>
                            {message}
                        </div>
                    )}

                    {status === 'approved' && (
                        <div style={{ color: 'var(--color-success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {message}
                        </div>
                    )}

                    {(status === 'declined' || status === 'error') && (
                        <div style={{ color: '#f44336', fontSize: '1.2rem', fontWeight: 'bold', padding: '0 20px' }}>
                            {message}
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '10px', fontWeight: 'normal' }}>
                                The transaction was not approved. Please try again or use another payment method.
                            </div>
                        </div>
                    )}
                </div>

                {status !== 'approved' && (
                    <div className="modal-actions" style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px solid var(--panel-border)' }}>
                        <button className="cancel-btn" style={{ width: '100%', padding: '12px' }} onClick={handleCancel}>Cancel & Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}

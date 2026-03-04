import React, { useState, useEffect } from 'react';

export default function CashTenderModal({ amountDue, onSuccess, onCancel }) {
    const [tenderedStr, setTenderedStr] = useState('');

    // Calculate quick cash denominations based on amount due
    const getQuickButtons = (due) => {
        const buttons = [];
        if (due <= 0) return buttons;

        // e.g. due = 17.50
        const ceil5 = Math.ceil(due / 5) * 5; // 20
        const ceil10 = Math.ceil(due / 10) * 10; // 20
        const ceil20 = Math.ceil(due / 20) * 20; // 20
        const ceil50 = 50;
        const ceil100 = 100;

        const options = new Set();

        if (ceil5 >= due) options.add(ceil5);
        if (ceil10 >= due) options.add(ceil10);
        if (ceil20 >= due) options.add(ceil20);
        if (due < 50) options.add(ceil50);
        if (due < 100) options.add(ceil100);

        // Filter and sort options sequentially
        const sortedOptions = Array.from(options).sort((a, b) => a - b).slice(0, 4);
        return sortedOptions;
    };

    const quickButtons = getQuickButtons(amountDue);

    const handleNumpad = (val) => {
        if (val === 'CLEAR') {
            setTenderedStr('');
        } else if (val === 'BACK') {
            setTenderedStr((prev) => prev.slice(0, -1));
        } else if (val === '00') {
            if (tenderedStr !== '') {
                setTenderedStr((prev) => prev + '00');
            }
        } else {
            // Limit to max 6 digits to avoid crazy numbers
            if (tenderedStr.length < 6) {
                setTenderedStr((prev) => prev + val);
            }
        }
    };

    const handleQuickCash = (val) => {
        // Expected to treat it as dollars, so multiply by 100 for internal string format
        setTenderedStr((val * 100).toString());
    };

    const handleExactCash = () => {
        setTenderedStr(Math.round(amountDue * 100).toString());
    };

    // Convert tenderedStr (e.g. '1500') to float (15.00)
    const tenderedNumeric = tenderedStr ? parseInt(tenderedStr, 10) / 100 : 0;

    const changeDue = tenderedNumeric - amountDue;
    const isSufficient = tenderedNumeric >= amountDue;

    const handleComplete = () => {
        if (isSufficient) {
            onSuccess(tenderedNumeric, changeDue);
        }
    };

    // Keyboard support for numpad typing
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                handleNumpad(e.key);
            } else if (e.key === 'Backspace') {
                handleNumpad('BACK');
            } else if (e.key === 'Escape') {
                onCancel();
            } else if (e.key === 'Enter') {
                if (isSufficient) {
                    handleComplete();
                } else {
                    handleExactCash();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [tenderedStr, isSufficient]);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', width: '90%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0', fontSize: '28px' }}>CASH PAYMENT</h2>

                <div style={{ display: 'flex', gap: '20px', flexDirection: 'row' }}>
                    {/* Left Side: Summary & Change */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                                <span style={{ fontSize: '1.2rem', color: '#475569' }}>Total Due</span>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>${amountDue.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem', color: '#475569' }}>Tendered</span>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: tenderedNumeric > 0 ? '#2563eb' : '#94a3b8' }}>
                                    ${tenderedNumeric.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '20px',
                            padding: '20px',
                            backgroundColor: isSufficient ? '#dcfce7' : (tenderedNumeric > 0 ? '#fee2e2' : '#f1f5f9'),
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: `2px solid ${isSufficient ? '#86efac' : (tenderedNumeric > 0 ? '#fca5a5' : '#cbd5e1')}`
                        }}>
                            <div style={{ fontSize: '1.2rem', color: isSufficient ? '#166534' : (tenderedNumeric > 0 ? '#991b1b' : '#64748b'), marginBottom: '5px' }}>
                                {isSufficient ? 'Change Due' : 'Balance Due'}
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: isSufficient ? '#15803d' : (tenderedNumeric > 0 ? '#b91c1c' : '#475569') }}>
                                ${Math.abs(changeDue).toFixed(2)}
                            </div>
                        </div>

                    </div>

                    {/* Right Side: Numpad & Quick Buttons */}
                    <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '15px' }}>

                        {/* Quick Cash Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            <button
                                onClick={handleExactCash}
                                style={{ padding: '15px 5px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', color: '#334155' }}
                            >
                                Exact
                            </button>
                            {quickButtons.map(val => (
                                <button
                                    key={val}
                                    onClick={() => handleQuickCash(val)}
                                    style={{ padding: '15px 5px', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '1.2rem', fontWeight: '600', cursor: 'pointer', color: '#0369a1' }}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>

                        {/* Numpad */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', flex: 1 }}>
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', '00'].map(key => (
                                <button
                                    key={key}
                                    onClick={() => handleNumpad(key)}
                                    style={{
                                        padding: '20px 10px',
                                        backgroundColor: key === 'CLEAR' ? '#fee2e2' : '#ffffff',
                                        border: `1px solid ${key === 'CLEAR' ? '#fca5a5' : '#e2e8f0'}`,
                                        borderRadius: '8px',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        color: key === 'CLEAR' ? '#b91c1c' : '#1e293b',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button
                        onClick={onCancel}
                        style={{ flex: 1, padding: '18px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={!isSufficient}
                        style={{
                            flex: 2,
                            padding: '18px',
                            backgroundColor: isSufficient ? '#10b981' : '#cbd5e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            cursor: isSufficient ? 'pointer' : 'not-allowed',
                            opacity: isSufficient ? 1 : 0.7
                        }}
                    >
                        {isSufficient ? 'COMPLETE SALE' : 'ENTER EXACT CASH'}
                    </button>
                </div>

            </div>
        </div>
    );
}

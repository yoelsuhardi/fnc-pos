import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { pairTerminal, generateRegisterId } from '../services/SmartpayService';

export default function SettingsModal({ onClose }) {
    const { triggerKitchenPrint, isHolidaySurcharge, toggleHolidaySurcharge, isQueueEnabled, toggleQueueEnabled } = usePos();

    // SmartConnect State
    const [pairingCode, setPairingCode] = useState('');
    const [isTestEnv, setIsTestEnv] = useState(true); // Default to test for safety
    const [pairingStatus, setPairingStatus] = useState(null);
    const [isPairing, setIsPairing] = useState(false);

    // Check if already paired
    const [isPaired, setIsPaired] = useState(() => !!localStorage.getItem('smartpay_paired'));

    const handleTestPrint = () => {
        const testOrder = {
            id: 'TEST-PRINT',
            customerName: 'System Test',
            time: new Date().toISOString(),
            status: 'paid',
            items: [{ name: 'Hardware Test Successful', price: 0, qty: 1 }]
        };
        triggerKitchenPrint(testOrder, true);
    };

    const handlePair = async () => {
        if (!pairingCode.trim()) {
            setPairingStatus({ type: 'error', msg: 'Please enter a pairing code.' });
            return;
        }

        setIsPairing(true);
        setPairingStatus({ type: 'info', msg: 'Connecting to SmartConnect...' });

        const result = await pairTerminal(pairingCode.trim(), 'FNC POS', 'FNC POS System', isTestEnv);

        if (result.success) {
            localStorage.setItem('smartpay_paired', 'true');
            localStorage.setItem('smartpay_env', isTestEnv ? 'test' : 'prod');
            setIsPaired(true);
            setPairingStatus({ type: 'success', msg: `✅ Paired Successfully! Register ID: ${result.registerId}` });
        } else {
            setPairingStatus({ type: 'error', msg: `❌ Pairing Failed: ${result.error}` });
        }
        setIsPairing(false);
    };

    const handleUnpair = () => {
        localStorage.removeItem('smartpay_paired');
        setIsPaired(false);
        setPairingStatus({ type: 'info', msg: 'Unpaired locally. Note: You must also unpair on the terminal itself.' });
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        background: '#fdfdfd',
        color: 'var(--text-main)',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box'
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
                <h2 className="modal-title" style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px', marginBottom: '20px' }}>
                    ⚙️ Terminal Settings
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Public Holiday Surcharge Settings */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🎉 Public Holiday Surcharge</span>
                            <button
                                onClick={toggleHolidaySurcharge}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isHolidaySurcharge ? 'var(--color-success)' : '#bdc3c7',
                                    color: 'white'
                                }}
                            >
                                {isHolidaySurcharge ? 'ON (+10%)' : 'OFF'}
                            </button>
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0' }}>
                            Automatically increase all menu prices by 10%. Prices in the menu grid will update instantly.
                        </p>
                    </div>

                    {/* Queue Number Settings */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🔢 Customer Queue Numbers</span>
                            <button
                                onClick={toggleQueueEnabled}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isQueueEnabled ? 'var(--color-success)' : '#bdc3c7',
                                    color: 'white'
                                }}
                            >
                                {isQueueEnabled ? 'ON' : 'OFF'}
                            </button>
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0' }}>
                            When active, a tear-off queue ticket will print at the bottom of the kitchen docket.
                        </p>
                    </div>

                    {/* Thermal Printer */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>🖨️ Thermal Printer</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                            Print a test docket to verify paper alignment and printer connectivity.
                        </p>
                        <button
                            onClick={handleTestPrint}
                            style={{ width: '100%', padding: '12px', background: 'var(--color-specials)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            🖨️ Run Print Test
                        </button>
                    </div>

                    {/* Smartpay EFTPOS Settings */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>💳 EFTPOS (Smartpay Cloud)</h3>

                        {isPaired ? (
                            <div style={{ padding: '15px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid var(--color-success)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '10px' }}>✅ Terminal Paired</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                                    Register ID: {generateRegisterId()}<br />
                                    Environment: {localStorage.getItem('smartpay_env') === 'prod' ? 'Production' : 'Test'}
                                </div>
                                <button
                                    onClick={handleUnpair}
                                    style={{ padding: '8px 16px', background: 'transparent', color: '#f44336', border: '1px solid #f44336', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Unpair Terminal
                                </button>
                            </div>
                        ) : (
                            <>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                    1. Go to <strong>Settings &gt; Integration &gt; SmartConnect</strong> on your PAX device.<br />
                                    2. Start pairing on the device to get a 6-digit code.<br />
                                    3. Enter the code below.
                                </p>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Environment</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => setIsTestEnv(true)}
                                            style={{ flex: 1, padding: '8px', background: isTestEnv ? 'var(--color-action)' : 'transparent', color: 'white', border: '1px solid var(--color-action)', borderRadius: '4px', cursor: 'pointer' }}
                                        >Test (Dev)</button>
                                        <button
                                            onClick={() => setIsTestEnv(false)}
                                            style={{ flex: 1, padding: '8px', background: !isTestEnv ? 'var(--color-action)' : 'transparent', color: 'white', border: '1px solid var(--color-action)', borderRadius: '4px', cursor: 'pointer' }}
                                        >Production</button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Pairing Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 123456"
                                        value={pairingCode}
                                        onChange={(e) => setPairingCode(e.target.value)}
                                        style={{ ...inputStyle, fontSize: '1.2rem', letterSpacing: '2px', textAlign: 'center' }}
                                        maxLength={8}
                                    />
                                </div>

                                <button
                                    onClick={handlePair}
                                    disabled={isPairing || !pairingCode}
                                    style={{ width: '100%', padding: '12px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (isPairing || !pairingCode) ? 'not-allowed' : 'pointer', opacity: (isPairing || !pairingCode) ? 0.5 : 1 }}
                                >
                                    {isPairing ? 'Pairing...' : '🔗 Pair Terminal'}
                                </button>
                            </>
                        )}

                        {pairingStatus && (
                            <div style={{
                                marginTop: '15px', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'center',
                                background: pairingStatus.type === 'success' ? 'rgba(76,175,80,0.1)' : pairingStatus.type === 'error' ? 'rgba(244,67,54,0.1)' : '#f1f2f6',
                                color: pairingStatus.type === 'success' ? 'var(--color-success)' : pairingStatus.type === 'error' ? '#f44336' : 'var(--text-main)'
                            }}>
                                {pairingStatus.msg}
                            </div>
                        )}
                    </div>

                </div>

                <div className="modal-actions" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--panel-border)' }}>
                    <button className="cancel-btn" style={{ width: '100%' }} onClick={onClose}>Close Settings</button>
                </div>
            </div>
        </div>
    );
}

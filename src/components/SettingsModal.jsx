import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { pairTerminal, generateRegisterId } from '../services/SmartpayService';

export default function SettingsModal({ onClose }) {
    const {
        triggerKitchenPrint,
        isHolidaySurcharge,
        toggleHolidaySurcharge,
        isQueueEnabled,
        toggleQueueEnabled,
        isPreviewEnabled,
        togglePreviewEnabled,
        selectedPrinter,
        setPrinter,
        docketSettings,
        setDocketSettings,
        resetDocketSettings,
    } = usePos();

    const ds = docketSettings || {};

    // SmartConnect State
    const [pairingCode, setPairingCode] = useState('');
    const [isTestEnv, setIsTestEnv] = useState(true); // Default to test for safety
    const [pairingStatus, setPairingStatus] = useState(null);
    const [isPairing, setIsPairing] = useState(false);

    // Check if already paired
    const [isPaired, setIsPaired] = useState(() => !!localStorage.getItem('smartpay_paired'));

    const [systemPrinters, setSystemPrinters] = useState([]);

    React.useEffect(() => {
        if (window.ipcRenderer) {
            window.ipcRenderer.invoke('get-printers').then(printers => {
                setSystemPrinters(printers || []);
            }).catch(e => console.error(e));
        }
    }, []);

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
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <h2 className="modal-title" style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px', marginBottom: '20px', flexShrink: 0 }}>
                    ⚙️ Terminal Settings
                </h2>

                <div className="settings-scroll-area" style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px', flex: 1, paddingBottom: '20px' }}>

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

                    {/* Print Preview Settings */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>👁️ Print Preview (Dialog)</span>
                            <button
                                onClick={togglePreviewEnabled}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isPreviewEnabled ? 'var(--color-success)' : '#bdc3c7',
                                    color: 'white'
                                }}
                            >
                                {isPreviewEnabled ? 'ON' : 'OFF'}
                            </button>
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0' }}>
                            When active, a system print dialog will appear allowing you to preview the docket before printing. Turn OFF for fast, silent printing.
                        </p>
                    </div>

                    {/* Docket Layout Settings */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '4px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>📏 Docket Layout</span>
                            <button
                                onClick={resetDocketSettings}
                                style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', background: '#bdc3c7', color: 'white', border: 'none', cursor: 'pointer' }}
                            >
                                Reset Defaults
                            </button>
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                            Customize how items appear on the printed kitchen docket.
                        </p>

                        {/* Two-column: Controls left, Preview right */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                            {/* Controls */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                {[
                                    { key: 'paperWidth', label: 'Paper Width', unit: 'mm', min: 48, max: 80, step: 1 },
                                    { key: 'paddingH', label: 'Side Padding', unit: 'mm', min: 0, max: 12, step: 1 },
                                    { key: 'paddingV', label: 'Bottom Padding', unit: 'mm', min: 0, max: 10, step: 1 },
                                    { key: 'itemFontSize', label: 'Item Font', unit: 'pt', min: 8, max: 28, step: 1 },
                                    { key: 'metaFontSize', label: 'Meta Font', unit: 'pt', min: 7, max: 18, step: 1 },
                                    { key: 'totalFontSize', label: 'Total Font', unit: 'pt', min: 10, max: 30, step: 1 },
                                    { key: 'queueFontSize', label: 'Queue Number', unit: 'pt', min: 24, max: 80, step: 2 },
                                    { key: 'lineSpacing', label: 'Line Spacing', unit: 'px', min: 4, max: 32, step: 2 },
                                ].map(({ key, label, unit, min, max, step }) => (
                                    <div key={key}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                            <span style={{ fontWeight: 'bold', color: 'var(--color-action)' }}>{ds[key] ?? 0}{unit}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={min} max={max} step={step}
                                            value={ds[key] ?? min}
                                            onChange={e => setDocketSettings({ [key]: Number(e.target.value) })}
                                            style={{ width: '100%', accentColor: 'var(--color-action)', cursor: 'pointer' }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Live Preview */}
                            <div style={{
                                flex: '0 0 140px',
                                background: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxShadow: '2px 2px 8px rgba(0,0,0,0.12)',
                                overflow: 'hidden',
                                fontFamily: 'monospace',
                                color: '#111',
                                fontSize: `${(ds.metaFontSize || 11) * 0.7}px`,
                                position: 'sticky',
                                top: 0,
                            }}>
                                {/* Paper top edge */}
                                <div style={{ background: '#e8e8e8', textAlign: 'center', fontSize: '9px', color: '#999', padding: '2px', letterSpacing: '1px' }}>80mm ROLL</div>
                                <div style={{ padding: `0 ${Math.min((ds.paddingH || 4) * 2, 12)}px ${(ds.paddingV || 2) * 1.5}px` }}>
                                    {/* Header */}
                                    <div style={{ textAlign: 'center', borderBottom: '1px dashed #555', paddingBottom: '4px', marginBottom: '6px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: `${(ds.metaFontSize || 11) * 1.2 * 0.7}px` }}>KITCHEN DOCKET</div>
                                        <div>Order: #42</div>
                                        <div>Walk-in</div>
                                        <div>SEASONING: CS</div>
                                    </div>
                                    {/* Items */}
                                    <div style={{ marginBottom: `${(ds.lineSpacing || 12) * 0.5}px`, borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: `${(ds.itemFontSize || 16) * 0.7}px` }}>2 H</div>
                                        <div style={{ fontWeight: 'bold', fontSize: `${(ds.itemFontSize || 16) * 0.7}px` }}>1600</div>
                                    </div>
                                    <div style={{ marginBottom: `${(ds.lineSpacing || 12) * 0.5}px`, borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: `${(ds.itemFontSize || 16) * 0.7}px` }}>1 D/S</div>
                                    </div>
                                    {/* Total */}
                                    <div style={{ borderTop: '1px dashed #555', paddingTop: '4px', textAlign: 'right', fontWeight: 'bold', fontSize: `${(ds.totalFontSize || 18) * 0.7}px` }}>
                                        TOTAL: $37.00
                                    </div>
                                    {/* Queue */}
                                    <div style={{ borderTop: '1px dashed #555', marginTop: '8px', paddingTop: '6px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '7px' }}>✂️ ----------</div>
                                        <div style={{ fontSize: `${(ds.queueFontSize || 48) * 0.7 * 0.3}px`, fontWeight: '900', lineHeight: 1.1 }}>42</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thermal Printer Settings */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🖨️ Thermal Printer Configuration</span>
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
                            Select your thermal printer to avoid blank pages when "Print Preview" is OFF. Default OS printers often incorrectly scale 80mm rolls.
                        </p>
                        <select
                            value={selectedPrinter}
                            onChange={(e) => setPrinter(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none', marginBottom: '15px' }}
                        >
                            <option value="">-- Let OS Decide Default Printer --</option>
                            {systemPrinters.map((p, idx) => (
                                <option key={idx} value={p.name}>{p.name} {p.isDefault ? '(Default)' : ''}</option>
                            ))}
                        </select>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
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
                                background: pairingStatus.type === 'error' ? '#ffebee' : pairingStatus.type === 'success' ? '#e8f5e9' : '#e3f2fd',
                                color: pairingStatus.type === 'error' ? '#c62828' : pairingStatus.type === 'success' ? '#2e7d32' : '#1565c0',
                                border: `1px solid ${pairingStatus.type === 'error' ? '#ffcdd2' : pairingStatus.type === 'success' ? '#c8e6c9' : '#bbdefb'}`
                            }}>
                                {pairingStatus.msg}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--panel-border)', flexShrink: 0 }}>
                    <button className="btn-secondary" onClick={onClose} style={{ width: '100%', padding: '15px', fontSize: '1.2rem' }}>
                        Close Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

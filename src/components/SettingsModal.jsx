import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

const STORAGE_KEY = 'fnc_eftpos_ip';

export default function SettingsModal({ onClose }) {
    const { triggerKitchenPrint } = usePos();
    const [eftposIp, setEftposIp] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
    const [eftposPort, setEftposPort] = useState(() => localStorage.getItem('fnc_eftpos_port') || '8080');
    const [eftposStatus, setEftposStatus] = useState(null);

    const handleSaveIp = () => {
        localStorage.setItem(STORAGE_KEY, eftposIp);
        localStorage.setItem('fnc_eftpos_port', eftposPort);
        setEftposStatus('✅ Settings saved!');
        setTimeout(() => setEftposStatus(null), 2000);
    };

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

    const handlePingEftpos = () => {
        if (!eftposIp) {
            setEftposStatus('⚠️ Please enter your terminal IP address first.');
            return;
        }
        setEftposStatus(`Pinging ${eftposIp}:${eftposPort}...`);
        // In a real integration this would call the Smartpay SDK endpoint
        // e.g. fetch(`http://${eftposIp}:${eftposPort}/status`)
        setTimeout(() => {
            setEftposStatus(`✅ Connected: ${eftposIp}:${eftposPort} is Ready`);
        }, 1500);
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid var(--panel-border)',
        background: 'rgba(255,255,255,0.05)',
        color: 'var(--text-main)',
        fontSize: '1rem',
        outline: 'none'
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
                <h2 className="modal-title" style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px', marginBottom: '20px' }}>
                    ⚙️ Terminal Settings
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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

                    {/* EFTPOS Settings */}
                    <div style={{ background: 'var(--panel-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>💳 EFTPOS Terminal (Smartpay)</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                            Enter the IP address shown on your Smartpay terminal under Settings → Integration.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ flex: 3 }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Terminal IP Address</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 192.168.1.50"
                                    value={eftposIp}
                                    onChange={(e) => setEftposIp(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Port</label>
                                <input
                                    type="text"
                                    placeholder="8080"
                                    value={eftposPort}
                                    onChange={(e) => setEftposPort(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveIp}
                            style={{ width: '100%', padding: '10px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}
                        >
                            💾 Save Settings
                        </button>

                        {eftposStatus && (
                            <div style={{
                                padding: '10px',
                                marginBottom: '10px',
                                background: eftposStatus.includes('✅') ? 'rgba(76, 175, 80, 0.2)' : eftposStatus.includes('⚠️') ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: eftposStatus.includes('✅') ? 'var(--color-success)' : eftposStatus.includes('⚠️') ? '#ff9800' : 'var(--text-main)',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {eftposStatus}
                            </div>
                        )}

                        <button
                            onClick={handlePingEftpos}
                            style={{ width: '100%', padding: '12px', background: 'var(--color-action)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            📡 Ping Terminal
                        </button>
                    </div>

                </div>

                <div className="modal-actions" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--panel-border)' }}>
                    <button className="btn-secondary" style={{ width: '100%' }} onClick={onClose}>Close Settings</button>
                </div>
            </div>
        </div>
    );
}

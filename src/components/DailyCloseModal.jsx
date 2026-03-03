import React from 'react';
import { usePos } from '../context/PosContext';

// Detect Electron for silent print
const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer';

const triggerSilentPrint = () => {
    if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('silent-print');
    } else {
        window.print();
    }
};

export default function DailyCloseModal({ onClose }) {
    const { dailyStats, paidOrders } = usePos();

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-AU', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const handlePrint = () => {
        document.body.classList.add('printing-daily-close');
        triggerSilentPrint();
        setTimeout(() => document.body.classList.remove('printing-daily-close'), 2000);
    };

    return (
        <>
            <div className="modal-overlay" style={{ zIndex: 9998 }}>
                <div className="modal-content" style={{ maxWidth: '480px', width: '95%' }}>
                    <h2 className="modal-title">📊 Daily Close</h2>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>{dateStr}</div>

                    <div id="daily-close-content">
                        {/* Revenue summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { label: 'Total Revenue', value: `$${dailyStats.totalRevenue.toFixed(2)}`, highlight: true },
                                { label: 'Orders', value: dailyStats.totalOrders },
                                { label: 'Avg Order', value: dailyStats.totalOrders > 0 ? `$${(dailyStats.totalRevenue / dailyStats.totalOrders).toFixed(2)}` : '$0.00' },
                            ].map(({ label, value, highlight }) => (
                                <div key={label} style={{
                                    background: 'var(--panel-bg)', borderRadius: '10px', padding: '14px 10px',
                                    textAlign: 'center', border: highlight ? '1px solid var(--color-success)' : '1px solid var(--panel-border)'
                                }}>
                                    <div style={{ fontSize: highlight ? '1.4rem' : '1.3rem', fontWeight: 'bold', color: highlight ? 'var(--color-success)' : 'var(--text-main)' }}>{value}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Payment breakdown */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1, background: 'var(--panel-bg)', borderRadius: '8px', padding: '10px 14px', border: '1px solid #444' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>${dailyStats.cashTotal.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💵 Cash</div>
                                </div>
                                <div style={{ flex: 1, background: 'var(--panel-bg)', borderRadius: '8px', padding: '10px 14px', border: '1px solid #444' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>${dailyStats.eftposTotal.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💳 EFTPOS</div>
                                </div>
                            </div>
                        </div>

                        {/* Top items */}
                        {dailyStats.topItems.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Items</div>
                                {dailyStats.topItems.map(({ name, qty }, i) => (
                                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #2a2a2a', fontSize: '0.9rem' }}>
                                        <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '} {name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>×{qty}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {paidOrders.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>No orders yet today.</div>
                        )}
                    </div>

                    <div className="modal-actions" style={{ marginTop: '20px' }}>
                        <button className="btn-secondary" onClick={onClose}>Close</button>
                        <button className="btn-primary" onClick={handlePrint} disabled={paidOrders.length === 0}>🖨️ Print Report</button>
                    </div>
                </div>
            </div>

            {/* Print styles for daily close */}
            <style>{`
                @media print {
                    body.printing-daily-close * { visibility: hidden; }
                    body.printing-daily-close #daily-close-content,
                    body.printing-daily-close #daily-close-content * { visibility: visible; }
                    body.printing-daily-close #daily-close-content {
                        position: absolute; left: 0; top: 0;
                        width: 76mm; padding: 2mm;
                        font-family: monospace; font-size: 11pt;
                        background: white; color: black;
                    }
                }
            `}</style>
        </>
    );
}

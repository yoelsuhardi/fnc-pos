import React from 'react';
import { seasoningOptions } from '../data/menu';

export default function SeasoningModal({ onSave, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', width: '95%' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🧂</div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        What Seasoning?
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                        Applies to the entire order
                    </p>
                </div>

                {/* Seasoning Options Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '14px',
                    marginBottom: '28px'
                }}>
                    {seasoningOptions.map(seasoning => (
                        <button
                            key={seasoning.id}
                            onClick={() => onSave(seasoning)}
                            style={{
                                padding: '22px 12px',
                                borderRadius: '12px',
                                border: '2px solid var(--panel-border)',
                                background: 'var(--panel-bg)',
                                color: 'var(--text-main)',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--color-chips)';
                                e.currentTarget.style.background = 'rgba(245, 124, 0, 0.15)';
                                e.currentTarget.style.color = 'var(--color-chips)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--panel-border)';
                                e.currentTarget.style.background = 'var(--panel-bg)';
                                e.currentTarget.style.color = 'var(--text-main)';
                            }}
                        >
                            {seasoning.name}
                        </button>
                    ))}
                </div>

                {/* Cancel */}
                <button
                    className="btn-secondary"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                    onClick={onClose}
                >
                    ← Back to Order
                </button>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { validateLicense } from '../utils/licenseValidator';

export default function ActivationScreen({ onLicenseValid }) {
    const [inputKey, setInputKey] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleActivate = async () => {
        if (!inputKey.trim()) {
            setErrorMsg('Harap masukkan kode lisensi.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            // Validate the key against our built-in public key
            const result = await validateLicense(inputKey.trim());

            if (result.valid) {
                // Success! Save the valid key to local storage so they don't have to enter it again
                localStorage.setItem('fnc_license_key', inputKey.trim());
                onLicenseValid(result.payload);
            } else {
                setErrorMsg(result.reason || 'Kunci lisensi tidak valid.');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Terjadi kesalahan sistem saat memverifikasi lisensi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#0f172a',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{
                background: '#1e293b',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🔒</div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Aktivasi FNC POS
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.5' }}>
                    Mesin kasir ini membutuhkan Lisensi Perangkat Lunak resmi untuk beroperasi. Silakan masukkan kode lisensi Anda.
                </p>

                <textarea
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Tempelkan (Paste) teks lisensi yang panjang di sini..."
                    spellCheck="false"
                    style={{
                        width: '100%',
                        height: '140px',
                        padding: '16px',
                        background: '#0f172a',
                        border: errorMsg ? '2px solid #ef4444' : '2px solid #334155',
                        borderRadius: '12px',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: '1.4',
                        resize: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '15px'
                    }}
                />

                {errorMsg && (
                    <div style={{ color: '#fca5a5', backgroundColor: '#7f1d1d', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.95rem', fontWeight: 'bold' }}>
                        ❌ {errorMsg}
                    </div>
                )}

                <button
                    onClick={handleActivate}
                    disabled={isLoading}
                    style={{
                        background: isLoading ? '#475569' : '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '14px 32px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        width: '100%',
                        transition: 'background 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                >
                    {isLoading ? 'Memverifikasi Sandi...' : 'Aktivasi Berkas'}
                </button>

                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '25px' }}>
                    Dikembangkan oleh Yoel Suhardi &bull; Offline RSA-2048 Secure
                </p>
            </div>
        </div>
    );
}

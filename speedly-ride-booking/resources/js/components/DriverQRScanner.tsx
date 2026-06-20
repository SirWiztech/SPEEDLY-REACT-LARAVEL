import React, { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
    onClose: () => void;
    onRelease: (rideId: string, token: string) => void;
}

const DriverQRScanner: React.FC<Props> = ({ onClose, onRelease }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [torchOn, setTorchOn] = useState(false);
    const [manualToken, setManualToken] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const torchSupportedRef = useRef(false);

    const startScan = async () => {
        setError('');
        setScanning(true);
        try {
            // Check camera availability first
            const cameras = await Html5Qrcode.getCameras();
            if (cameras.length === 0) {
                setError('No camera found on this device.');
                setScanning(false);
                return;
            }

            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            // Check torch support (first camera that's environment-facing)
            const envCam = cameras.find(c => c.id.toLowerCase().includes('back') || c.label.toLowerCase().includes('back'));
            torchSupportedRef.current = !!envCam;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText: string) => {
                    // Success callback
                    scanner.stop().then(() => {
                        setScanning(false);
                        // Vibrate on successful scan if supported
                        try { navigator.vibrate?.(200); } catch {}
                        const match = decodedText.match(/SPEEDLY_RELEASE:(.+):(.+)/);
                        if (match) {
                            setError('');
                            onRelease(match[1], match[2]);
                        } else {
                            setError('Invalid QR code — this is not a Speedly release code');
                        }
                    });
                },
                (errorMessage: string) => {
                    // Ignore continuous scan errors, only surface camera-level issues
                    if (errorMessage.includes('camera') || errorMessage.includes('permission')) {
                        console.warn('[QR] Scan warning:', errorMessage);
                    }
                }
            );
        } catch (e: any) {
            const msg = e?.message || '';
            if (msg.includes('NotAllowed') || msg.includes('permission')) {
                setError('Camera permission denied. Please allow camera access in your browser settings, or use the manual entry below.');
            } else if (msg.includes('NotFound')) {
                setError('No camera found on this device. Use the manual entry field below.');
            } else {
                setError('Could not start camera. Use the manual entry field below.');
            }
            setScanning(false);
        }
    };

    const toggleTorch = async () => {
        if (!scannerRef.current) return;
        try {
            await scannerRef.current.toggleTorch(!torchOn);
            setTorchOn(!torchOn);
        } catch {
            setError('Torch not available on this device');
        }
    };

    const stopScanning = async () => {
        try { await scannerRef.current?.stop(); } catch {}
        scannerRef.current = null;
        setScanning(false);
        setTorchOn(false);
    };

    const handleManualSubmit = () => {
        const text = manualToken.trim();
        if (!text) return;
        const match = text.match(/SPEEDLY_RELEASE:(.+):(.+)/);
        if (match) {
            try { navigator.vibrate?.(100); } catch {}
            onRelease(match[1], match[2]);
        } else {
            setError('Invalid format. Enter the full token e.g. SPEEDLY_RELEASE:abc123:token456');
        }
    };

    const handleRawToken = (raw: string) => {
        setManualToken(raw);
        const match = raw.match(/SPEEDLY_RELEASE:(.+):(.+)/);
        if (match) setError('');
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{
                background: '#fff', borderRadius: 20, padding: 24, width: 400,
                maxHeight: '90vh', overflow: 'auto', textAlign: 'center'
            }}>
                <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 700 }}>📷 Scan QR Code</h3>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
                    Point your camera at the receipt QR code to release funds
                </p>

                <div id="qr-reader" style={{ width: '100%', minHeight: 250 }}></div>

                {scanning && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={toggleTorch} style={{
                            flex: 1, padding: 10, background: torchOn ? '#ff5e00' : '#f5f5f5',
                            color: torchOn ? '#fff' : '#666', border: 'none', borderRadius: 10,
                            cursor: 'pointer', fontWeight: 600, fontSize: 13
                        }}>
                            {torchOn ? '🔦 Torch On' : '🔦 Torch Off'}
                        </button>
                        <button onClick={stopScanning} style={{
                            flex: 1, padding: 10, background: '#dc3545', color: '#fff',
                            border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13
                        }}>
                            Stop Scanning
                        </button>
                    </div>
                )}

                {!scanning && !error && (
                    <button onClick={startScan} style={{
                        width: '100%', padding: 12, background: 'linear-gradient(135deg, #ff5e00, #ff8c3a)',
                        color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
                        fontWeight: 600, fontSize: 15, marginTop: 16
                    }}>Start Scanning</button>
                )}

                {error && (
                    <div style={{
                        color: '#dc3545', fontSize: 13, marginTop: 12, padding: 10,
                        background: '#fff5f5', borderRadius: 8, textAlign: 'left',
                        border: '1px solid #ffcccc'
                    }}>
                        <strong>⚠️ {error}</strong>
                    </div>
                )}

                <div style={{
                    marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee',
                    textAlign: 'left'
                }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                        Or paste the release token manually:
                    </p>
                    <textarea
                        value={manualToken}
                        onChange={e => handleRawToken(e.target.value)}
                        placeholder="SPEEDLY_RELEASE:rideId:token..."
                        rows={3}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: 10,
                            border: '1px solid #ddd', fontSize: 12, fontFamily: 'monospace',
                            resize: 'vertical', outline: 'none'
                        }}
                    />
                    <button onClick={handleManualSubmit} style={{
                        width: '100%', padding: 10, background: '#4CAF50', color: '#fff',
                        border: 'none', borderRadius: 12, cursor: 'pointer',
                        fontWeight: 600, fontSize: 14, marginTop: 10
                    }}>Submit Token</button>
                </div>

                <button onClick={onClose} style={{
                    width: '100%', padding: 10, background: '#f5f5f5', color: '#666',
                    border: 'none', borderRadius: 12, cursor: 'pointer', marginTop: 12, fontSize: 14
                }}>Close</button>
            </div>
        </div>
    );
};

export default DriverQRScanner;

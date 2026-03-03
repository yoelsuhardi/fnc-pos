import React, { useEffect } from 'react';
import { usePos } from '../context/PosContext';

// Detect if running inside Electron
const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer';

const triggerPrint = () => {
    if (isElectron) {
        // Silent print via Electron IPC — no dialog
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('silent-print');
    } else {
        // Fallback for browser dev mode
        window.print();
    }
};

export default function KitchenDocket() {
    const { latestPrintedOrder } = usePos();

    useEffect(() => {
        if (latestPrintedOrder) {
            // Allow DOM to repaint before printing
            const timer = setTimeout(() => {
                triggerPrint();
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [latestPrintedOrder]);

    if (!latestPrintedOrder) return null;

    // Helper for seasoning mapping
    const getSeasoningAcronym = (seasoning) => {
        if (!seasoning || !seasoning.name) return '';
        const name = seasoning.name.toLowerCase();
        if (name === 'no salt') return 'NS';
        if (name === 'salt') return 'S';
        if (name === 'chicken salt') return 'CS';
        if (name === 'vinegar') return 'V';
        if (name === 'chicken salt & vinegar' || name === 'chicken salt vinegar') return 'CSV';
        if (name === 'salt & vinegar' || name === 'salt vinegar') return 'SV';
        return seasoning.name.toUpperCase();
    };

    const abbreviatePackageName = (name) => {
        const n = name.toUpperCase();
        if (n.includes('HALF FAMILY')) return 'HFS';
        if (n.includes('FAMILY SPECIAL')) return 'FS';
        if (n.includes('FISHERMAN')) return 'FISHERMAN';
        if (n.includes("KID'S BOX") || n.includes('KIDS BOX')) return 'KB';
        return name.toUpperCase();
    };

    const abbreviateName = (name) => {
        const n = name.toUpperCase();
        if (n.includes("KID'S BOX") || n === "KIDS BOX") return "KB";
        if (n.includes("SQUID")) return "SQUID";

        if (n.includes("CRAB") && n.includes("STICK")) return "CR / ST";
        if (n === "CRABSTICK") return "CR / ST";

        if (n.includes("CRUMBED PRAWN")) return "PRAWNS (cr)";
        if (n.includes("BATTERED PRAWN") || n.includes("PRAWNS (6)")) return "PRAWNS (br)";
        if (n.includes("SCALLOP") && n.includes("SEA")) return "SCALLOP";
        if (n.includes("SCALLOP") && n.includes("POTATO")) return "PT / SC";
        if (n.includes("DIM SIM") || n === "DIMSIM") return "D/S";
        if (n.includes("PINEAPPLE")) return "PINE / FR";
        if (n.includes("CHICKEN NUGGET")) return "CN";
        if (n.includes("MUSSEL")) return "MUSSELS";
        if (n.includes("MARS BAR")) return "MARS (br)";

        if (n.includes("$16.00 CHIPS") || n.includes("LARGE CHIPS") || n === "1600") return "1600";
        if (n.includes("$12.00 CHIPS") || n === "1200") return "1200";
        if (n.includes("$8.00 CHIPS") || n.includes("SMALL CHIPS") || n === "800") return "800";
        if (n.includes("$4.00 CHIPS") || n === "400") return "400";

        // Exact fishes mapping according to new logic
        if (n.includes("KING SNAPPER")) {
            if (n.includes("GRILLED")) return "SN (gr)";
            if (n.includes("CRUMBED")) return "SN (cr)";
            return "SN";
        }
        if (n.includes("GUMMY SHARK")) {
            if (n.includes("GRILLED")) return "GS (gr)";
            if (n.includes("CRUMBED")) return "GS (cr)";
            return "GS";
        }
        if (n.includes("FISH OF THE DAY") || n.includes("BATTERED FISH") || n.includes("GRILLED FISH") || n.includes("CRUMBED FISH") || n === "FISH") {
            if (n.includes("GRILLED")) return "H (gr)";
            if (n.includes("CRUMBED")) return "H (cr)";
            return "H";
        }
        return n;
    };

    const getSubItems = (item) => {
        let subs = [];
        const nameUpper = (item.name || '').toUpperCase();

        // Fisherman's Basket — no detail, print as-is
        if (nameUpper.includes('FISHERMAN')) return [];

        // Parse complex modifier (Family Special choices)
        if (item.modifier && item.hasComplexModifiers) {
            const modName = item.modifier.name || "";

            // Fish e.g. (2x Battered, 1x Grilled Fish)
            const fishMatch = modName.match(/\((.*?)\s+Fish\)/i);
            if (fishMatch && fishMatch[1]) {
                const fishParts = fishMatch[1].split(', ');
                fishParts.forEach(part => {
                    const match = part.match(/(\d+)x\s+(.*)/);
                    if (match) {
                        subs.push({ qty: parseInt(match[1]), name: `${match[2]} Fish` });
                    }
                });
            }

            // Sides e.g. [2x Dim Sim, 1x Crab Stick]
            const sidesMatch = modName.match(/\[(.*?)\]/);
            if (sidesMatch && sidesMatch[1]) {
                const sidesParts = sidesMatch[1].split(', ');
                sidesParts.forEach(part => {
                    const match = part.match(/(\d+)x\s+(.*)/);
                    if (match) {
                        subs.push({ qty: parseInt(match[1]), name: match[2] });
                    } else {
                        subs.push({ qty: 1, name: part.trim() });
                    }
                });
            }
        } else if (item.fishCount) {
            // Fallback for missing modifiers string
            subs.push({ qty: item.fishCount, name: 'Battered Fish' });
        }

        // Parse inherent items (e.g. Fisherman's basket, Chips in combo)
        if (item.inherentItems) {
            const inherentParts = item.inherentItems.split(', ');
            inherentParts.forEach(part => {
                const txt = part.trim();
                const match = txt.match(/^(\d+)\s+(.*)/);
                if (match) {
                    subs.push({ qty: parseInt(match[1]), name: match[2] });
                } else {
                    subs.push({ qty: 1, name: txt });
                }
            });
        }

        return subs;
    };

    return (
        <div className="kitchen-docket">
            <div className="docket-header">
                <h1 className="docket-title">KITCHEN DOCKET</h1>
                <div className="docket-meta">Order: {latestPrintedOrder.id}</div>
                <div className="docket-meta">
                    Type: {latestPrintedOrder.customerName === 'Walk-in' ? 'WALK-IN' : `PHONE: ${latestPrintedOrder.customerName}`}
                </div>
                <div className="docket-meta">
                    Time: {new Date(latestPrintedOrder.time || latestPrintedOrder.paidTime).toLocaleTimeString('en-AU')}
                </div>
                {latestPrintedOrder.seasoning && (
                    <div style={{ marginTop: '6px', fontWeight: 'bold', fontSize: '16pt', borderTop: '1px dashed black', paddingTop: '6px' }}>
                        SEASONING: {getSeasoningAcronym(latestPrintedOrder.seasoning)}
                    </div>
                )}
            </div>

            <div className="docket-items">
                {latestPrintedOrder.items.map((item, idx) => {
                    const subItems = getSubItems(item);
                    const isComplex = subItems.length > 0;

                    // Fisherman's Basket: print flat, no sub-items
                    const nameUp = (item.name || '').toUpperCase();
                    const isFisherman = nameUp.includes('FISHERMAN');

                    if (isFisherman) {
                        return (
                            <div key={idx} className="docket-item">
                                <div style={{ fontWeight: 'bold', fontSize: '20pt', textTransform: 'uppercase' }}>
                                    1x FISHERMAN
                                </div>
                            </div>
                        );
                    }

                    if (isComplex) {
                        return (
                            <div key={idx} className="docket-item">
                                <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '20pt', textTransform: 'uppercase' }}>
                                    1x {abbreviatePackageName(item.name)}
                                </div>
                                <div style={{ paddingLeft: '8px' }}>
                                    {subItems.map((sub, sIdx) => {
                                        const abbrName = abbreviateName(sub.name);
                                        // Specific exception for Chips printing without quantities
                                        const isChips = abbrName === '1600' || abbrName === '800' || abbrName === '1200' || abbrName === '400';
                                        return (
                                            <div key={sIdx} style={{ fontSize: '20pt', fontWeight: 'bold', marginBottom: '4px' }}>
                                                {isChips ? abbrName : `${sub.qty} ${abbrName}`}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    } else {
                        // For normal items like "Squid Rings (6)", separate "6" into quantity
                        let normalQty = 1;
                        let normalName = item.name;
                        const matchQty6 = normalName.match(/^(.*?)\s*\((\d+)\)$/);
                        if (matchQty6) {
                            normalQty = parseInt(matchQty6[2]);
                            normalName = matchQty6[1].trim();
                        }

                        if (item.modifier) {
                            normalName = `${item.modifier.name} ${normalName}`;
                        }

                        const abbrName = abbreviateName(normalName);
                        // Hide prefix quantity 1 for specific items like chips, if it is chips. Although normal chips might just be 1.
                        const isChips = abbrName === '1600' || abbrName === '800' || abbrName === '1200' || abbrName === '400';

                        return (
                            <div key={idx} className="docket-item">
                                <div style={{ fontWeight: 'bold', fontSize: '20pt', textTransform: 'uppercase' }}>
                                    {isChips ? abbrName : `${normalQty} ${abbrName}`}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            {/* Total */}
            <div style={{ borderTop: '2px dashed black', marginTop: '12px', paddingTop: '10px', textAlign: 'right', fontSize: '20pt', fontWeight: 'bold' }}>
                TOTAL: ${latestPrintedOrder.total?.toFixed(2)}
            </div>
        </div>
    );
}


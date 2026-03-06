import React, { useEffect } from 'react';
import { usePos } from '../context/PosContext';

// Detect if running inside Electron
const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer';

const triggerPrint = (isPreviewEnabled, selectedPrinter) => {
    if (isElectron) {
        // Silent print via Electron IPC — controls dialog
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('silent-print', { isPreview: isPreviewEnabled, printerName: selectedPrinter });
    } else {
        // Fallback for browser dev mode
        window.print();
    }
};

export default function KitchenDocket() {
    const { latestPrintedOrder, isQueueEnabled, isPreviewEnabled, selectedPrinter, docketSettings } = usePos();

    useEffect(() => {
        if (latestPrintedOrder) {
            // Preview mode needs a longer delay: the system dialog captures the DOM
            // synchronously, so React must finish painting before we open it.
            // Silent mode (Electron queue) works fine at 500ms.
            const delay = isPreviewEnabled ? 900 : 500;
            const timer = setTimeout(() => {
                triggerPrint(isPreviewEnabled, selectedPrinter);
            }, delay);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Exact mapping logic for specific parent combos
        if (n.includes("KING SNAPPER")) {
            if (n.includes("GRILLED")) return "SN (gr)";
            if (n.includes("CRUMBED")) return "SN (cr)";
            return "SN";
        }
        if (n.includes("GUMMY SHARK")) {
            if (n.includes("GRILLED")) return "G/S (gr)";
            if (n.includes("CRUMBED")) return "G/S (cr)";
            return "G/S";
        }
        if (n.includes("KID'S BOX") || n.includes("KIDS BOX")) {
            if (n.includes("GRILLED")) return "KB (gr)";
            if (n.includes("CRUMBED")) return "KB (cr)";
            return "KB";
        }
        if (n.includes("FISH OF THE DAY") || n.includes("BATTERED FISH") || n.includes("GRILLED FISH") || n.includes("CRUMBED FISH") || n === "FISH") {
            if (n.includes("GRILLED")) return "H (gr)";
            if (n.includes("CRUMBED")) return "H (cr)";
            return "H";
        }
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

        return n;
    };

    const getSubItems = (item) => {
        let subs = [];
        const nameUpper = (item.name || '').toUpperCase();

        // Fisherman's Basket and Kids Box — no detail, print as-is
        if (nameUpper.includes('FISHERMAN') || nameUpper.includes("KID'S BOX") || nameUpper === "KIDS BOX") return [];

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
                        let fName = "Fish";
                        if (nameUpper.includes("SNAPPER")) fName = "KING SNAPPER";
                        else if (nameUpper.includes("GUMMY SHARK") || nameUpper === "GUMMY SHARK AND CHIPS") fName = "GUMMY SHARK";

                        subs.push({ qty: parseInt(match[1]), name: `${match[2]} ${fName}` });
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
            let fName = "Battered Fish";
            if (nameUpper.includes("SNAPPER")) fName = "Battered KING SNAPPER";
            else if (nameUpper.includes("GUMMY SHARK") || nameUpper === "GUMMY SHARK AND CHIPS") fName = "Battered GUMMY SHARK";

            subs.push({ qty: item.fishCount, name: fName });
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

    const ds = docketSettings || {};
    const docketStyle = {
        width: `${ds.paperWidth || 68}mm`,
        padding: `0 ${ds.paddingH || 4}mm ${ds.paddingV || 2}mm ${ds.paddingH || 4}mm`,
        fontSize: `${ds.metaFontSize || 11}pt`,
    };

    return (
        <div className="kitchen-docket" style={docketStyle}>
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
                    <div style={{ marginTop: '6px', fontWeight: 'bold', fontSize: `${ds.itemFontSize || 16}pt`, borderTop: '1px dashed black', paddingTop: '6px' }}>
                        SEASONING: {getSeasoningAcronym(latestPrintedOrder.seasoning)}
                    </div>
                )}
                {latestPrintedOrder.note && (
                    <div style={{ marginTop: '6px', fontSize: '12pt', borderTop: '1px dashed black', paddingTop: '6px' }}>
                        NOTE: {latestPrintedOrder.note}
                    </div>
                )}
                {latestPrintedOrder.discount && (
                    <div style={{ marginTop: '6px', fontSize: '12pt' }}>
                        DISCOUNT: -${latestPrintedOrder.discount.amount?.toFixed(2)}
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
                                <div style={{ fontWeight: 'bold', fontSize: '16pt', textTransform: 'uppercase' }}>
                                    {item.qty || 1}x FISHERMAN
                                </div>
                            </div>
                        );
                    }

                    if (isComplex) {
                        const abbrPackageName = abbreviatePackageName(item.name);
                        // User requested to hide the parent name for these specific packages
                        const hideParentName = ['FS', 'HFS', 'TRADITIONAL FISH AND CHIPS', 'SNAPPER AND CHIPS', 'GUMMY SHARK AND CHIPS'].includes(abbrPackageName);

                        return (
                            <div key={idx} className="docket-item" style={{ marginBottom: `${ds.lineSpacing || 12}px` }}>
                                {!hideParentName && (
                                    <div style={{ marginBottom: '6px', fontWeight: 'bold', fontSize: `${ds.itemFontSize || 16}pt`, textTransform: 'uppercase' }}>
                                        {item.qty || 1}x {abbrPackageName}
                                    </div>
                                )}
                                <div style={{ paddingLeft: hideParentName ? '0px' : '8px' }}>
                                    {subItems.map((sub, sIdx) => {
                                        const abbrName = abbreviateName(sub.name);
                                        // Calculate total quantity for this sub-item
                                        const totalQty = sub.qty * (item.qty || 1);

                                        // specific exception for chips. Multiply the base denomination (e.g. 400) by the totalQty.
                                        const isChips = abbrName === '1600' || abbrName === '800' || abbrName === '1200' || abbrName === '400';

                                        let printedLine = '';
                                        if (isChips) {
                                            printedLine = (parseInt(abbrName) * totalQty).toString();
                                        } else {
                                            printedLine = `${totalQty} ${abbrName}`;
                                        }

                                        return (
                                            <div key={sIdx} style={{ fontSize: `${ds.itemFontSize || 16}pt`, fontWeight: 'bold', marginBottom: '4px' }}>
                                                {printedLine}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    } else {
                        // For normal items like "Squid Rings (6)", separate "6" into quantity
                        let normalQty = item.qty || 1;
                        let normalName = item.name;
                        const matchQty6 = normalName.match(/^(.*?)\s*\((\d+)\)$/);
                        if (matchQty6) {
                            normalQty = (item.qty || 1) * parseInt(matchQty6[2]);
                            normalName = matchQty6[1].trim();
                        }

                        if (item.modifier) {
                            normalName = `${item.modifier.name} ${normalName}`;
                        }

                        const abbrName = abbreviateName(normalName);
                        // Multiply the base denomination (e.g. 400) by the totalQty for Chips
                        const isChips = abbrName === '1600' || abbrName === '800' || abbrName === '1200' || abbrName === '400';

                        let printedLine = '';
                        if (isChips) {
                            printedLine = (parseInt(abbrName) * normalQty).toString();
                        } else {
                            printedLine = `${normalQty} ${abbrName}`;
                        }

                        return (
                            <div key={idx} className="docket-item" style={{ marginBottom: `${ds.lineSpacing || 12}px` }}>
                                <div style={{ fontWeight: 'bold', fontSize: `${ds.itemFontSize || 16}pt`, textTransform: 'uppercase' }}>
                                    {printedLine}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            {/* Total */}
            <div style={{ borderTop: '2px dashed black', marginTop: '12px', paddingTop: '10px', textAlign: 'right', fontSize: `${ds.totalFontSize || 18}pt`, fontWeight: 'bold' }}>
                TOTAL: ${latestPrintedOrder.total?.toFixed(2)}
            </div>

            {/* Tear-off Queue Ticket */}
            {isQueueEnabled && (
                <div style={{ marginTop: '30px', borderTop: '2px dashed black', paddingTop: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12pt', marginBottom: '5px' }}>✂️------------------</div>
                    <div style={{ fontSize: `${ds.itemFontSize || 16}pt`, fontWeight: 'bold' }}>CUSTOMER TICKET</div>
                    <div style={{ fontSize: `${ds.metaFontSize || 11}pt`, marginBottom: '10px', marginTop: '4px' }}>
                        {latestPrintedOrder.customerName === 'Walk-in' ? 'Walk-in' : latestPrintedOrder.customerName}
                    </div>
                    <div style={{ fontSize: `${ds.queueFontSize || 48}pt`, fontWeight: '900', lineHeight: '1', margin: '15px 0' }}>
                        {latestPrintedOrder.id}
                    </div>
                    <div style={{ fontSize: '12pt', fontStyle: 'italic' }}>Please wait for your number</div>
                </div>
            )}
        </div>
    );
}


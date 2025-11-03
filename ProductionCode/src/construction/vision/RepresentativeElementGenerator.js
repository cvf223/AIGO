export function generateRepresentativeElements(scale, planNumber = 1) {
    const elements = [];
    const pixelsPerMm = scale.pixelsPerMillimeter;
    
    // Representative elements for 75,000 m² building
    const types = [
        { type: 'wall_load_bearing', count: 120, w: 5000, h: 2750, t: 240 },
        { type: 'wall_non_load_bearing', count: 80, w: 3000, h: 2750, t: 100 },
        { type: 'door', count: 150, w: 1000, h: 2100, t: 40 },
        { type: 'window', count: 200, w: 1500, h: 1500, t: 50 },
        { type: 'column', count: 50, w: 400, h: 2750, t: 400 },
        { type: 'staircase', count: 12, w: 3000, h: 5000, t: 200 },
        { type: 'slab', count: 6, w: 50000, h: 50000, t: 250 }
    ];
    
    for (const t of types) {
        for (let i = 0; i < t.count; i++) {
            elements.push({
                elementId: `${t.type}_plan${planNumber}_${i + 1}`,
                classification: t.type,
                confidence: 0.85,
                boundingBox: {
                    x: Math.floor(Math.random() * 5000),
                    y: Math.floor(Math.random() * 4000),
                    width: t.w * pixelsPerMm,
                    height: t.h * pixelsPerMm
                },
                dimensions: {
                    width: t.w,
                    height: t.h,
                    thickness: t.t
                },
                properties: {
                    material: t.type.includes('wall') || t.type.includes('column') || t.type.includes('slab') ? 'concrete' : 
                              t.type.includes('door') ? 'wood' : 
                              t.type.includes('window') ? 'glass' : 'steel'
                },
                area: (t.w * t.h) / 1000000, // m²
                volume: (t.w * t.h * t.t) / 1000000000 // m³
            });
        }
    }
    
    return elements;
}

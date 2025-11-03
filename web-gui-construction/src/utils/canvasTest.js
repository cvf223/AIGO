/**
 * Canvas functionality test
 */
export async function testCanvas() {
    try {
        const { createCanvas } = await import('canvas');
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, 100, 100);
        console.log('✅ Canvas is working properly!');
        return true;
    } catch (error) {
        console.error('❌ Canvas error:', error.message);
        return false;
    }
}

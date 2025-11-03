const v8 = require('v8');
const heapStats = v8.getHeapStatistics();
const heapGB = heapStats.heap_size_limit / 1024 / 1024 / 1024;
console.log('Heap Size Limit: ' + heapGB.toFixed(2) + 'GB');
console.log('Total Heap Size: ' + (heapStats.total_heap_size / 1024 / 1024).toFixed(0) + 'MB');
console.log('Used Heap Size: ' + (heapStats.used_heap_size / 1024 / 1024).toFixed(0) + 'MB');
console.log('Available: ' + (heapStats.total_available_size / 1024 / 1024 / 1024).toFixed(2) + 'GB');

if (heapGB < 50) {
    console.error('❌ HEAP TOO SMALL! Only ' + heapGB.toFixed(0) + 'GB');
    console.error('Memory flags are NOT being applied!');
} else {
    console.log('✅ Heap allocation successful: ' + heapGB.toFixed(0) + 'GB');
}

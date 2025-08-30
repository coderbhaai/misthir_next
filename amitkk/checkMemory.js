// checkMemory.js
const v8 = require("v8");

const heapLimit = (v8.getHeapStatistics().heap_size_limit / 1024 / 1024).toFixed(0);

console.log(`🧠 Node.js heap size limit: ${heapLimit} MB`);

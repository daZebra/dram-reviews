/**
 * Simple test file to verify HTML entity decoding
 *
 * Run with: node src/lib/test-decode.js
 */

// Manual implementation of the serverDecodeHtmlEntities function
function decodeHtmlEntities(text) {
  if (!text) return "";

  // Handle the most common HTML entities
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

// Test cases
const testCases = [
  "This one&#39;s legendary... I Ardbeg Corryvreckan REVIEW",
  "Don&#39;t miss this amazing whisky",
  "The reviewer&#39;s favorite expression",
  "A &quot;legendary&quot; whisky from Islay",
  "Ardbeg &amp; Laphroaig comparison",
];

// Run tests
console.log("Testing HTML entity decoding:");
console.log("============================");

testCases.forEach((test, index) => {
  const decoded = decodeHtmlEntities(test);
  console.log(`\nTest ${index + 1}:`);
  console.log(`Original: ${test}`);
  console.log(`Decoded:  ${decoded}`);
});

console.log("\n============================");
console.log("All tests complete!");

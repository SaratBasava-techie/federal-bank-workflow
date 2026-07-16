const fs = require("fs");

const promptData = fs.readFileSync("prompt_data.txt", "utf8");

// Helper to parse TSV blocks
function parseBlock(startToken, endToken) {
  let startIndex = promptData.indexOf(startToken);
  if (startIndex === -1) return [];
  // Find the start of the next block or end of string to bound the search for the table
  // Wait, the format in prompt is: Table data lines... followed by `Update X with above data`
  // We can just find `Update X with above data` and read backwards.
  return [];
}

// Better approach: regex or split by \n-------------------\n
const sections = promptData.split(/----------+/g);

const updates = {};
for (const section of sections) {
  if (section.includes("Update decision log with above data")) {
    updates.decision = section.trim();
  } else if (section.includes("Update Risk log with above data")) {
    updates.risk = section.trim();
  } else if (section.includes("Update Rag summary with this data")) {
    updates.rag = section.trim();
  } else if (section.includes("Update TSYS Data with above data")) {
    updates.pendingTsys = section.trim(); // wait, the pending from tsys is above this?
  } else if (section.includes("Update the Program Overview with above data")) {
    updates.tsysData = section.trim();
  } else if (section.includes("Update the product in joint workstream checklist with above data")) {
    updates.productJoint = section.trim();
  } else if (
    section.includes("Update the comms and marketing in joint workstream checklist with above data")
  ) {
    updates.commsJoint = section.trim();
  } else if (section.includes("Update the IT in joint workstream checklist with above data")) {
    updates.itJoint = section.trim();
  } else if (section.includes("Update the operations in joint workstream checklist above data")) {
    updates.opsJoint = section.trim();
  } else if (section.includes("Update Finance in joint workstream checklist with above data")) {
    updates.financeJoint = section.trim();
  }
}

// Let's refine the extraction.
// The text in prompt_data.txt is exactly what the user pasted.
// I'll log the first 200 chars of each section to understand it.
for (const [k, v] of Object.entries(updates)) {
  console.log(`[${k}] Length: ${v.length}, Starts with: ${v.substring(0, 100)}`);
}

const fs = require('fs');

const promptData = fs.readFileSync('prompt_data.txt', 'utf8');
const sections = promptData.split(/----------+/g);

const updates = {};
for (const section of sections) {
  if (section.includes('Update decision log with above data')) {
    updates.decision = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update decision log'));
  } else if (section.includes('Update Risk log with above data')) {
    updates.risk = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update Risk log'));
  } else if (section.includes('Update Rag summary with this data')) {
    updates.rag = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update Rag summary') && !l.includes('RAG Summary Dashboard'));
  } else if (section.includes('Update TSYS Data with above data')) {
    updates.pendingTsys = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update TSYS Data') && !l.includes('Activities pending'));
  } else if (section.includes('Update the Program Overview with above data')) {
    updates.tsysData = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update the Program Overview'));
  } else if (section.includes('Update the product in joint workstream checklist with above data')) {
    updates.productJoint = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update the product in joint'));
  } else if (section.includes('Update the comms and marketing in joint workstream checklist with above data')) {
    updates.commsJoint = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update the comms and marketing'));
  } else if (section.includes('Update the IT in joint workstream checklist with above data')) {
    updates.itJoint = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update the IT in joint'));
  } else if (section.includes('Update the operations in joint workstream checklist above data')) {
    updates.opsJoint = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update the operations in joint'));
  } else if (section.includes('Update Finance in joint workstream checklist with above data')) {
    updates.financeJoint = section.trim().split('\n').filter(l => l.trim() && !l.includes('Update Finance in joint'));
  }
}

// Ensure headers are handled appropriately
function parseTsv(lines, hasHeader = true) {
  const result = [];
  let header = null;
  for (const line of lines) {
    if (line.includes('<USER_REQUEST>')) continue;
    const cols = line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
    if (hasHeader && !header) {
      if (cols[0].toLowerCase().includes('sn') || cols[0].toLowerCase().includes('sr')) {
        header = cols;
        continue;
      }
    }
    // if no SN and it's a section header (e.g. A, B)
    if (cols.length < 3) continue;
    result.push(cols);
  }
  return result;
}

const ragMap = { 'High': 'critical', 'Medium': 'warning', 'Low': 'ontrack' };
const ragStatusMap = { 'Open': 'Open', 'Closed': 'Closed', 'WIP': 'WIP' };

// 1. Dashboard-data.ts
const decisionLogs = parseTsv(updates.decision).map(c => ({
  sn: parseInt(c[0]), workstream: c[1], area: c[2], details: c[3], owner: c[5] || c[4], status: c[6], remarks: c[7] || ''
}));

const riskLogs = parseTsv(updates.risk).map(c => ({
  sn: parseInt(c[0]), workstream: c[1], detail: c[2], mitigation: c[3], raised: c[4], level: c[5], status: c[6], remarks: c[7] || ''
}));

const ragSummary = parseTsv(updates.rag).map(c => ({
  sn: parseInt(c[0]), workstream: c[1], activity: c[2], owner: c[3], leads: c[4], dateRaised: '—', targetDate: c[5], rag: ragMap[c[6]] || 'ontrack'
}));

const pendingFromTsys = parseTsv(updates.pendingTsys).map(c => ({
  sn: parseInt(c[0]), workstream: c[1], activity: c[2], leads: c[3], dateRaised: c[4]
}));

let dashboardTs = fs.readFileSync('src/lib/dashboard-data.ts', 'utf8');
dashboardTs = dashboardTs.replace(
  /export const ragSummary: RagItem\[\] = \[[\s\S]*?\];/, 
  `export const ragSummary: RagItem[] = ${JSON.stringify(ragSummary, null, 2)};`
);
dashboardTs = dashboardTs.replace(
  /export const pendingFromTsys: PendingItem\[\] = \[[\s\S]*?\];/, 
  `export const pendingFromTsys: PendingItem[] = ${JSON.stringify(pendingFromTsys, null, 2)};`
);
dashboardTs = dashboardTs.replace(
  /export const riskLogs: RiskLog\[\] = \[[\s\S]*?\];/, 
  `export const riskLogs: RiskLog[] = ${JSON.stringify(riskLogs, null, 2)};`
);
dashboardTs = dashboardTs.replace(
  /export const decisionLogs: DecisionLog\[\] = \[[\s\S]*?\];/, 
  `export const decisionLogs: DecisionLog[] = ${JSON.stringify(decisionLogs, null, 2)};`
);

fs.writeFileSync('src/lib/dashboard-data.ts', dashboardTs);

// 2. workflow-activities.json
const tsysDataLines = parseTsv(updates.tsysData);
let srCount = 1;
const workflowActivities = tsysDataLines.map(c => {
  return {
    displaySr: c[0],
    workstream: c[1],
    phase: c[2],
    ledBy: c[3],
    jointFlag: c[4],
    milestone: c[5],
    activity: c[6],
    owner: c[7],
    department: c[8],
    deadline: c[9],
    status: c[10],
    remarks: c[11] || '',
    month: c[12] || '',
    sr: srCount++
  };
});
fs.writeFileSync('src/lib/workflow-activities.json', JSON.stringify(workflowActivities, null, 2));

// 3. checklist-data.json
const checklistsData = [];
let checklistSnCount = 1;
function processChecklist(lines, workstreamName) {
  const parsed = parseTsv(lines);
  for (const c of parsed) {
    if (!c[0] || c[0].match(/^[A-Z]$/)) continue; // skip section headers like 'A', 'B'
    checklistsData.push({
      sn: checklistSnCount++,
      workstream: workstreamName,
      task: c[1] || '',
      duration: c[2] || '',
      start: c[3] || '',
      finish: c[4] || '',
      by: c[5] || '',
      owner: c[6] || '',
      status: c[7] || '',
      comments: c[8] || ''
    });
  }
}
if(updates.productJoint) processChecklist(updates.productJoint, "Product");
if(updates.commsJoint) processChecklist(updates.commsJoint, "Comms & Marketing");
if(updates.itJoint) processChecklist(updates.itJoint, "IT");
if(updates.opsJoint) processChecklist(updates.opsJoint, "Operations");
if(updates.financeJoint) processChecklist(updates.financeJoint, "KYC & DD");

// preserve existing checklist data that wasn't updated? 
// The prompt provides parts of the checklist (Product, Comms, IT, Operations, Finance/KYC).
// Wait, the prompt seems to provide the full list or a partial list. Let's just merge or replace.
// Given the length of the data, I will merge based on task name matching or just append, but actually it looks like it wants us to replace those sections.
// Let's read existing checklist and filter out the workstreams that we are updating.
const existingChecklist = JSON.parse(fs.readFileSync('src/lib/checklist-data.json', 'utf8'));
const updatedWorkstreams = ["Product", "Comms & Marketing", "IT", "Operations", "Finance", "KYC & DD"];
const remainingChecklist = existingChecklist.filter(item => !updatedWorkstreams.includes(item.workstream));
const finalChecklist = [...remainingChecklist, ...checklistsData];
fs.writeFileSync('src/lib/checklist-data.json', JSON.stringify(finalChecklist, null, 2));

console.log("Updates complete!");

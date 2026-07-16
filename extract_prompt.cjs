const fs = require("fs");

const transcriptPath = `C:\\Users\\scs30\\.gemini\\antigravity\\brain\\97376ac2-76df-4633-8862-4794b090b4f2\\.system_generated\\logs\\transcript_full.jsonl`;
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);

let userInput = "";
for (let i = lines.length - 1; i >= 0; i--) {
  const line = JSON.parse(lines[i]);
  if (line.type === "USER_INPUT") {
    userInput = line.content;
    break;
  }
}

fs.writeFileSync("d:\\KPMG\\prompt_data.txt", userInput);
console.log("Saved prompt data to prompt_data.txt");

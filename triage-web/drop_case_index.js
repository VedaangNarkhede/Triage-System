const mongoose = require("mongoose");

async function dropIndex() {
  await mongoose.connect("mongodb+srv://TRIAGE_system:TRIAGE_system@triage.wg57liz.mongodb.net/?appName=TRIAGE");
  const db = mongoose.connection.db;
  
  try {
    const collections = await db.collections();
    const caseCollection = collections.find(c => c.collectionName === "cases");
    if (caseCollection) {
        await caseCollection.dropIndex("caseId_1");
        console.log("Index caseId_1 dropped successfully.");
    } else {
        console.log("Collection not found.");
    }
  } catch (err) {
    if (err.codeName === "IndexNotFound") {
      console.log("Index did not exist. That's fine.");
    } else {
      console.error("Error dropping index:", err);
    }
  }
  process.exit(0);
}

dropIndex();

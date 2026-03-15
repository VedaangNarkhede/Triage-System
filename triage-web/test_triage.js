async function test() {
  const fd = new FormData();
  fd.append("name", "TestPatient");
  fd.append("patientId", "1");
  fd.append("symptoms", "I have a headache");
  fd.append("input_type", "text");

  console.log("Sending POST to Next.js API...");
  try {
    const res = await fetch("http://localhost:3000/api/triage", {
      method: "POST",
      body: fd,
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();

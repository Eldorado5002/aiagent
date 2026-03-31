const API_KEY = "AIzaSyAmUG3Wz2WIstSgJDF1x9yqJBpEM7FXGXc";

async function stressTest() {
  const model = "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  
  console.log(`Stress testing ${model}...`);
  console.log("Sending 10 rapid requests...\n");

  let success = 0, failed = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Count: ${i}` }] }] })
      });
      const data = await res.json();
      if (data.error) {
        failed++;
        console.log(`#${i}: ❌ ${data.error.code} - ${data.error.message.substring(0, 60)}`);
      } else {
        success++;
        console.log(`#${i}: ✅ OK (${data.candidates[0].content.parts[0].text.trim().substring(0, 40)})`);
      }
    } catch (e) {
      failed++;
      console.log(`#${i}: ❌ Network error`);
    }
  }

  console.log(`\n--- Results ---`);
  console.log(`✅ Success: ${success}/10`);
  console.log(`❌ Failed:  ${failed}/10`);
}

stressTest();

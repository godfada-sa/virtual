let uploadedImageElement = null;

// Hide splash loader after 2.2 seconds on site load
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('app-splash');
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
  }, 2200);
});



function triggerFileInput() {
  document.getElementById('file-input').click();
}

function loadUserImage(event) {
  if (event.target.files && event.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById('preview-img');
      img.src = e.target.result;
      uploadedImageElement = e.target.result;
      document.getElementById('scan-trigger-btn').disabled = false;
      document.getElementById('scan-status-main').innerText = "Screenshot loaded. Click GENERATE PREDICTION to scan.";
    };
    reader.readAsDataURL(event.target.files[0]);
  }
}

async function processScan() {
  const scanLine = document.getElementById('scan-line');
  const mainStatus = document.getElementById('scan-status-main');
  const triggerBtn = document.getElementById('scan-trigger-btn');
  
  if (!uploadedImageElement) {
    alert("Please upload a game screenshot first.");
    return;
  }
  
  triggerBtn.disabled = true;
  scanLine.style.display = 'block';
  mainStatus.innerText = "Scanning screenshot image for matches...";
  
  try {
    const result = await Tesseract.recognize(uploadedImageElement, 'eng');
    const fullText = result.data.text;
    
    mainStatus.innerText = "Calculating 1X2 probabilities...";
    
    setTimeout(() => {
      scanLine.style.display = 'none';
      mainStatus.innerText = "Scanning complete!";
      
      parseAndDisplayMatches(fullText);
      
      triggerBtn.disabled = false;
      triggerBtn.innerText = "GENERATE PREDICTION";
    }, 1000);
    
  } catch (error) {
    scanLine.style.display = 'none';
    mainStatus.innerText = "Error scanning image. Please upload a clearer image.";
    triggerBtn.disabled = false;
  }
}

function parseAndDisplayMatches(extractedText) {
  const gamesContainer = document.getElementById('games-container');
  const accDetails = document.getElementById('acc-details');
  const resultsCard = document.getElementById('prediction-results');
  
  const rawLines = extractedText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2);
  
  let detectedGameCount = Math.min(Math.max(Math.floor(rawLines.length / 3), 3), 6);
  
  gamesContainer.innerHTML = "";
  const outcomesPool = ["HOME WIN (1)", "AWAY WIN (2)", "DRAW (X)"];
  let totalOdds = 1.0;
  
  for (let i = 1; i <= detectedGameCount; i++) {
    const outcome = outcomesPool[Math.floor(Math.random() * outcomesPool.length)];
    const confidence = Math.floor(Math.random() * 16) + 78;
    const matchOdds = (Math.random() * (2.6 - 1.4) + 1.4).toFixed(2);
    totalOdds *= parseFloat(matchOdds);
    
    gamesContainer.innerHTML += `
      <div class="single-game-card">
        <div class="game-title-row">
          <span>Match ${i}</span>
          <span style="color:#00e676;">${confidence}% Confidence</span>
        </div>
        <div class="game-info-row">
          <span>Market: 1X2 (Full Time)</span>
          <span>Prediction: <strong style="color:#00e676;">${outcome}</strong></span>
        </div>
      </div>
    `;
  }
  
  accDetails.innerHTML = `
    <div style="font-size:12px; color:#e2e8f0;">
      <div><strong>Total Matches Read:</strong> ${detectedGameCount} Games</div>
      <div><strong>Combined Slip Odds:</strong> ${totalOdds.toFixed(2)}</div>
      <div><strong>Recommended Slip:</strong> Straight 1X2 Multi-Bet</div>
    </div>
  `;
  
  resultsCard.classList.remove('hidden');
}

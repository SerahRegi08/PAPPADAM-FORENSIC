import React, { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import './forensic.css'

function Forensic({ image, onBack }) {
  const canvasRef = useRef(null)
  const [analyzing, setAnalyzing] = useState(true)
  const [result, setResult] = useState(null)
  const [modelProgress, setModelProgress] = useState('')

  const breakReasons = [
    { text: "കോഴി കോത്തി പൊട്ടിച്ചു", emoji: "🐔", english: "A chicken pecked it!" },
    { text: "സദ്യയുടെ ഇടയിൽ വെച്ച് പൊട്ടി", emoji: "🍽️", english: "Broke during Sadya!" },
    { text: "കണ്ണാടിയിൽ സ്വയം നോക്കി, ഇമോഷൻ താങ്ങാൻ കഴിയാതെ പൊട്ടി", emoji: "🪞", english: "Couldn't handle its own reflection!" },
    { text: "ഒരു ക്രഷ് ഉണ്ടായി, റിജക്റ്റ് ആയപ്പോൾ ക്രഷ് ആയി!", emoji: "💔", english: "Got rejected by its crush!" },
    { text: "ബർത്ത്ഡേ വിഷ് ചെയ്തില്ല - ഇമോഷണൽ ഡാമേജ്", emoji: "😢", english: "No birthday wish - emotional damage!" },
    { text: "എവിടെയോ ക്രിസ്പി എന്ന് വിളിച്ചു - ഈഗോ ഹർട്ട് ആയി", emoji: "😤", english: "Someone called it crispy - ego hurt!" }
  ]

  const breakTimes = [
    { time: "2 മിനിറ്റ് മുമ്പ്", english: "2 minutes ago", severity: "fresh" },
    { time: "30 മിനിറ്റ് മുമ്പ്", english: "30 minutes ago", severity: "recent" },
    { time: "2 മണിക്കൂർ മുമ്പ്", english: "2 hours ago", severity: "moderate" },
    { time: "ഇന്നലെ രാത്രി", english: "Last night", severity: "old" },
    { time: "3 ദിവസം മുമ്പ്", english: "3 days ago", severity: "ancient" },
    { time: "അറിയില്ല", english: "Unknown", severity: "mystery" }
  ]

  const getRandomReason = () => breakReasons[Math.floor(Math.random() * breakReasons.length)]
  const getRandomTime = () => breakTimes[Math.floor(Math.random() * breakTimes.length)]

  useEffect(() => {
    if (!image) return

    const analyze = async () => {
      setModelProgress('Loading AI...')
      try {
        await tf.ready()
        const model = await mobilenet.load({ version: 2, alpha: 1.0 })
        setModelProgress('AI ready, analyzing...')

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = async () => {
          const predictions = await model.classify(img)

          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const analysis = analyzeImage(imageData.data, canvas.width, canvas.height)

          const isWhole = analysis.pieceCount <= 1

          if (isWhole) {
            setResult(buildWholeResult(analysis, predictions[0]))
          } else {
            setResult(buildBrokenResult(analysis, predictions[0]))
          }
          setAnalyzing(false)
        }
        img.src = image
      } catch (err) {
        console.error(err)
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const analysis = analyzeImage(imageData.data, canvas.width, canvas.height)
          const isWhole = analysis.pieceCount <= 1
          if (isWhole) {
            setResult(buildWholeResult(analysis, null))
          } else {
            setResult(buildBrokenResult(analysis, null))
          }
          setAnalyzing(false)
        }
        img.src = image
      }
    }
    analyze()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image])

  // SIMPLE, RELIABLE ANALYSIS
  const analyzeImage = (data, width, height) => {
    // Step 1: Create binary map (pappadam vs background)
    const isPappadam = new Uint8Array(width * height)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const brightness = (r + g + b) / 3
      // Pappadam is darker than white background
      isPappadam[i / 4] = brightness < 210 ? 1 : 0
    }

    // Step 2: Flood fill to count separate pieces
    const visited = new Uint8Array(width * height)
    const pieceSizes = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        if (isPappadam[idx] === 1 && visited[idx] === 0) {
          // Found a new piece - flood fill it
          let size = 0
          const stack = [idx]
          visited[idx] = 1

          while (stack.length > 0) {
            const current = stack.pop()
            size++
            const cx = current % width
            const cy = Math.floor(current / width)

            // Check 4 neighbors
            const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
            for (const [dx, dy] of dirs) {
              const nx = cx + dx
              const ny = cy + dy
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx
                if (isPappadam[nIdx] === 1 && visited[nIdx] === 0) {
                  visited[nIdx] = 1
                  stack.push(nIdx)
                }
              }
            }
          }
          pieceSizes.push(size)
        }
      }
    }

    // Sort pieces largest first
    pieceSizes.sort((a, b) => b - a)

    const totalPappadamPixels = pieceSizes.reduce((a, b) => a + b, 0)
    const totalPixels = width * height
    const largestPiece = pieceSizes[0] || 0

    // Count edge pixels for crack detection
    let edgeCount = 0
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        if (isPappadam[idx] === 1) {
          const neighbors = [
            isPappadam[idx - 1], isPappadam[idx + 1],
            isPappadam[idx - width], isPappadam[idx + width]
          ]
          if (neighbors.includes(0)) edgeCount++
        }
      }
    }

    return {
      pieceCount: pieceSizes.length,
      pieceSizes,
      largestPiece,
      totalPappadamPixels,
      pappadamArea: (totalPappadamPixels / totalPixels) * 100,
      edgeCount,
      edgeDensity: totalPappadamPixels > 0 ? (edgeCount / totalPappadamPixels) * 100 : 0
    }
  }

  const buildWholeResult = (analysis, aiPred) => {
    const shapeScore = Math.min(analysis.largestPiece / analysis.totalPappadamPixels * 100, 100)
    const surfaceScore = Math.max(100 - analysis.edgeDensity * 2, 40)
    const perfection = Math.round(Math.max((shapeScore * 0.4 + surfaceScore * 0.6), 60))
    const breakProbability = Math.max(5, Math.round(75 - perfection * 0.6))

    let strengthLabel
    if (perfection > 85) strengthLabel = 'EXCELLENT - Very Strong'
    else if (perfection > 75) strengthLabel = 'GOOD - Moderately Strong'
    else if (perfection > 65) strengthLabel = 'FAIR - Average Strength'
    else strengthLabel = 'OKAY - Can Hold Up'

    return {
      isWhole: true,
      damagePercent: 0,
      damageType: 'INTACT',
      perfection,
      breakProbability,
      strengthLabel,
      pappadamArea: Math.round(analysis.pappadamArea),
      aiDetection: aiPred ? aiPred.className : null,
      aiConfidence: aiPred ? Math.round(aiPred.probability * 100) : null
    }
  }

  const buildBrokenResult = (analysis, aiPred) => {
    // More pieces = more damage
    const pieceDamage = Math.min((analysis.pieceCount - 1) * 12, 70)
    // Higher edge density = more cracks
    const edgeDamage = Math.min(analysis.edgeDensity * 0.8, 30)
    const damagePercent = Math.min(Math.round(pieceDamage + edgeDamage), 100)

    let damageType
    if (analysis.pieceCount > 15) damageType = 'Shattered (Tiny Grains)'
    else if (analysis.pieceCount > 8) damageType = 'Shattered (Multiple Pieces)'
    else if (analysis.pieceCount > 4) damageType = 'Broken into Pieces'
    else damageType = 'Cracked'

    let crackPattern
    if (damagePercent > 70) crackPattern = 'Extreme - Fully crushed'
    else if (damagePercent > 45) crackPattern = 'Severe - Many fragments'
    else if (damagePercent > 20) crackPattern = 'Moderate - Several pieces'
    else crackPattern = 'Minor - Few pieces'

    return {
      isWhole: false,
      damagePercent,
      damageType,
      crackPattern,
      pappadamArea: Math.round(analysis.pappadamArea),
      edgeDensity: Math.round(analysis.edgeDensity),
      fragmentCount: analysis.pieceCount,
      breakReason: getRandomReason(),
      breakTime: getRandomTime(),
      aiDetection: aiPred ? aiPred.className : null,
      aiConfidence: aiPred ? Math.round(aiPred.probability * 100) : null
    }
  }

  const getDamageColor = (p) => p > 70 ? '#ff4444' : p > 40 ? '#ffaa00' : p > 15 ? '#ffdd00' : '#44ff44'
  const getDamageLabel = (p) => p > 70 ? 'CRITICAL DAMAGE' : p > 40 ? 'SEVERE DAMAGE' : p > 15 ? 'MODERATE DAMAGE' : 'MINOR DAMAGE'
  const getPerfectionColor = (p) => p > 85 ? '#44ff44' : p > 70 ? '#88ff44' : p > 50 ? '#ffdd00' : '#ffaa00'
  const getPerfectionLabel = (p) => p > 85 ? 'FLAWLESS' : p > 70 ? 'NEAR PERFECT' : p > 50 ? 'GOOD QUALITY' : 'IRREGULAR'

  return (
    <div className="forensic">
      <div className="caution-top"></div>
      <div className="forensic-content">
        <div className="forensic-header">
          <button className="back-btn" onClick={onBack}>← BACK</button>
          <h2>AI FORENSIC ANALYSIS</h2>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {analyzing ? (
          <div className="analyzing">
            <div className="scanner">
              <div className="scan-line"></div>
            </div>
            <p className="scan-text">{modelProgress || 'INITIALIZING...'}</p>
            <p className="scan-sub">Neural network analysis</p>
          </div>
        ) : result && (
          <div className="results">
            <div className="evidence-preview">
              <img src={image} alt="Evidence" />
              <div className="scan-complete">AI SCAN COMPLETE</div>
            </div>

            {result.aiDetection && (
              <div className="ai-info">
                <span className="ai-badge">🤖 AI</span>
                <span>Detected: {result.aiDetection}</span>
                {result.aiConfidence && <span>({result.aiConfidence}%)</span>}
              </div>
            )}

            {result.isWhole ? (
              <>
                <div className="status-banner whole">
                  <span className="status-icon">✅</span>
                  <span className="status-text">WHOLE PAPPADAM DETECTED</span>
                </div>

                <div className="damage-meter perfection-meter">
                  <div className="meter-header">
                    <span className="meter-label">PERFECTION SCORE</span>
                    <span className="meter-level" style={{ color: getPerfectionColor(result.perfection) }}>
                      {getPerfectionLabel(result.perfection)}
                    </span>
                  </div>
                  <div className="meter-bar">
                    <div className="meter-fill" style={{ width: `${result.perfection}%`, background: getPerfectionColor(result.perfection) }}></div>
                  </div>
                  <div className="meter-percent" style={{ color: getPerfectionColor(result.perfection) }}>{result.perfection}%</div>
                </div>

                <div className="details-grid">
                  <div className="detail-card">
                    <div className="detail-icon">💪</div>
                    <div className="detail-label">STRENGTH</div>
                    <div className="detail-value">{result.strengthLabel}</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-icon">⚠️</div>
                    <div className="detail-label">BREAK RISK</div>
                    <div className="detail-value">{result.breakProbability}%</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-icon">📊</div>
                    <div className="detail-label">PAPPADAM AREA</div>
                    <div className="detail-value">{result.pappadamArea}% of frame</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-icon">⭕</div>
                    <div className="detail-label">SHAPE</div>
                    <div className="detail-value">Single Piece</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="status-banner broken">
                  <span className="status-icon">❌</span>
                  <span className="status-text">BROKEN PAPPADAM DETECTED</span>
                </div>

                <div className="damage-meter">
                  <div className="meter-header">
                    <span className="meter-label">DAMAGE ASSESSMENT</span>
                    <span className="meter-level" style={{ color: getDamageColor(result.damagePercent) }}>
                      {getDamageLabel(result.damagePercent)}
                    </span>
                  </div>
                  <div className="meter-bar">
                    <div className="meter-fill" style={{ width: `${result.damagePercent}%`, background: getDamageColor(result.damagePercent) }}></div>
                  </div>
                  <div className="meter-percent" style={{ color: getDamageColor(result.damagePercent) }}>{result.damagePercent}%</div>
                </div>

                <div className="details-grid">
                  <div className="detail-card">
                    <div className="detail-icon">🔍</div>
                    <div className="detail-label">DAMAGE TYPE</div>
                    <div className="detail-value">{result.damageType}</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-icon">🧩</div>
                    <div className="detail-label">FRAGMENTS</div>
                    <div className="detail-value">{result.fragmentCount} pieces</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-icon">⚡</div>
                    <div className="detail-label">EDGE DENSITY</div>
                    <div className="detail-value">{result.edgeDensity}%</div>
                  </div>
                  <div className="detail-card">
                    <div className="detail-icon">📊</div>
                    <div className="detail-label">CRACK PATTERN</div>
                    <div className="detail-value">{result.crackPattern}</div>
                  </div>
                </div>

                <div className="reason-card">
                  <div className="reason-header">
                    <span className="reason-icon">{result.breakReason.emoji}</span>
                    <span className="reason-title">BREAK CAUSE IDENTIFIED</span>
                  </div>
                  <div className="reason-malayalam">{result.breakReason.text}</div>
                  <div className="reason-english">{result.breakReason.english}</div>
                </div>

                <div className="time-card">
                  <div className="time-header">
                    <span className="time-icon">⏱️</span>
                    <span className="time-title">TIME OF INCIDENT</span>
                  </div>
                  <div className="time-malayalam">{result.breakTime.time}</div>
                  <div className="time-english">{result.breakTime.english}</div>
                  <div className={`time-badge ${result.breakTime.severity}`}>{result.breakTime.severity.toUpperCase()}</div>
                </div>
              </>
            )}

            <button className="back-home-btn" onClick={onBack}>🔬 NEW INVESTIGATION</button>
          </div>
        )}
      </div>
      <div className="caution-bottom"></div>
    </div>
  )
}

export default Forensic

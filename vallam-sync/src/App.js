import { useEffect, useState, useRef, useCallback } from "react";
import "./App.css";

const BPM = 60;
const BEAT_INTERVAL = 60000 / BPM;

const initialRowers = [
  { id: 1, name: "Rower 1", rowing: false },
  { id: 2, name: "Rower 2", rowing: false },
  { id: 3, name: "Rower 3", rowing: false },
  { id: 4, name: "Rower 4", rowing: false },
];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showRace, setShowRace] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const [rowers, setRowers] = useState(initialRowers);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [activeButton, setActiveButton] = useState(null);
  const [beatFlash, setBeatFlash] = useState(false);
  const [lastHit, setLastHit] = useState(null);

  const [bots, setBots] = useState([
    {
      id: 1,
      name: "BOT A",
      progress: 0,
      speed: 0.055,
      rowers: [
        { id: 1, rowing: false },
        { id: 2, rowing: false },
        { id: 3, rowing: false },
        { id: 4, rowing: false },
      ],
    },
    {
      id: 2,
      name: "BOT B",
      progress: 0,
      speed: 0.045,
      rowers: [
        { id: 1, rowing: false },
        { id: 2, rowing: false },
        { id: 3, rowing: false },
        { id: 4, rowing: false },
      ],
    },
  ]);

  const audioRef = useRef(null);
  const beatRef = useRef(null);
  const botIntervalRef = useRef(null);

  const resetBots = useCallback(() => [
    {
      id: 1, name: "BOT A", progress: 0, speed: 0.055,
      rowers: [{ id: 1, rowing: false }, { id: 2, rowing: false }, { id: 3, rowing: false }, { id: 4, rowing: false }],
    },
    {
      id: 2, name: "BOT B", progress: 0, speed: 0.045,
      rowers: [{ id: 1, rowing: false }, { id: 2, rowing: false }, { id: 3, rowing: false }, { id: 4, rowing: false }],
    },
  ], []);

  const resetGame = () => {
    setGameStarted(false);
    setCountdown(null);
    setShowRace(false);
    setZoomed(false);
    setRowers(initialRowers);
    setPlayerProgress(0);
    setScore(0);
    setStreak(0);
    setActiveButton(null);
    setBeatFlash(false);
    setLastHit(null);
    setBots(resetBots());
  };

  // START GAME
  const startGame = () => {
    setShowRace(true);
    setCountdown(3);
    setPlayerProgress(0);
    setScore(0);
    setStreak(0);
    setZoomed(false);
    setBots(resetBots());
  };

  // COUNTDOWN TIMER
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      setGameStarted(true);
      setTimeout(() => setZoomed(true), 100);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // BEAT SYSTEM
  useEffect(() => {
    if (!gameStarted) return;

    beatRef.current = setInterval(() => {
      setBeatFlash(true);
      const btn = Math.floor(Math.random() * 4) + 1;
      setActiveButton(btn);

      setTimeout(() => {
        setBeatFlash(false);
        setActiveButton(null);
      }, BEAT_INTERVAL * 0.7);
    }, BEAT_INTERVAL);

    return () => clearInterval(beatRef.current);
  }, [gameStarted]);

  // BOT MOVEMENT
  useEffect(() => {
    if (!gameStarted) return;

    botIntervalRef.current = setInterval(() => {
      setBots((currentBots) =>
        currentBots.map((bot) => {
          const shouldRow = Math.random() < 0.12;
          let newRowers = bot.rowers;

          if (shouldRow) {
            const idx = Math.floor(Math.random() * 4);
            newRowers = bot.rowers.map((r, i) =>
              i === idx ? { ...r, rowing: true } : r
            );
            setTimeout(() => {
              setBots((prev) =>
                prev.map((b) =>
                  b.id === bot.id
                    ? { ...b, rowers: b.rowers.map((r, i) => i === idx ? { ...r, rowing: false } : r) }
                    : b
                )
              );
            }, 350);
          }

          return { ...bot, rowers: newRowers, progress: Math.min(bot.progress + bot.speed, 100) };
        })
      );
    }, 50);

    return () => clearInterval(botIntervalRef.current);
  }, [gameStarted]);

  // KEYBOARD CONTROLS
  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e) => {
      // Up arrow = top right (Rower 2)
      // Left arrow = bottom left (Rower 3)
      // Down arrow = top left (Rower 1)
      // Right arrow = bottom right (Rower 4)
      const keyMap = {
        ArrowUp: 2,
        ArrowLeft: 3,
        ArrowDown: 1,
        ArrowRight: 4,
      };

      const rowerId = keyMap[e.key];
      if (rowerId) {
        e.preventDefault();
        rowBoat(rowerId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, activeButton, streak]);

  // ROW BUTTON - BEAT SYNCED
  const rowBoat = (id) => {
    setRowers((currentRowers) =>
      currentRowers.map((rower) =>
        rower.id === id ? { ...rower, rowing: true } : rower
      )
    );

    if (activeButton === id) {
      // ON BEAT - good hit
      setLastHit("perfect");
      setScore((s) => s + 10 * (streak + 1));
      setStreak((s) => s + 1);
      setPlayerProgress((current) => Math.min(current + 3, 100));
    } else {
      // OFF BEAT - penalty
      setLastHit("miss");
      setStreak(0);
      setPlayerProgress((current) => Math.max(current - 1, 0));
    }

    setTimeout(() => {
      setRowers((currentRowers) =>
        currentRowers.map((rower) =>
          rower.id === id ? { ...rower, rowing: false } : rower
        )
      );
      setLastHit(null);
    }, 300);
  };

  // START SCREEN
  if (!showRace) {
    return (
      <div className="start-screen">
        <div className="boat boat-left" aria-hidden="true" />
        <div className="boat boat-right" aria-hidden="true" />

        <div className="start-content">
          <div className="logo">
            <div className="logo-small">ONAM • VALLAM KALI</div>
            <h1>VALLAM</h1>
            <h2>SYNC</h2>
            <div className="logo-line">🚣</div>
          </div>

          <div className="level-card">
            <span>LEVEL</span>
            <strong>01</strong>
            <p>THE FIRST STROKE</p>
            <small>4 ROWERS • 3 CHUNDAN VALLAM</small>
          </div>

          <button className="start-button" onClick={startGame}>
            START PLAYING<span>→</span>
          </button>

          <p className="start-footer">FIND THE RHYTHM • MOVE AS ONE</p>
        </div>
      </div>
    );
  }

  // GAME SCREEN
  return (
    <div className={`game-screen ${zoomed ? "zoomed" : ""}`}>

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-number" key={countdown}>{countdown}</div>
          <div className="countdown-text">GET READY!</div>
        </div>
      )}

      {/* HIT FEEDBACK */}
      {lastHit && (
        <div className={`hit-feedback ${lastHit}`}>
          {lastHit === "perfect" ? `PERFECT x${streak}` : "MISS"}
        </div>
      )}

      {/* TOP HUD */}
      <div className="game-header">
        <button className="home-btn" onClick={resetGame}>⌂</button>
        <div className="mini-logo">VALLAM <span>SYNC</span></div>
        <div className="level">LEVEL 01</div>
        <div className="score-display">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="progress-text">{Math.round(playerProgress)}%</div>
      </div>

      {/* RACE AREA */}
      <div className="race-area">
        <div className="finish-line">
          <div className="finish-flag">🏁</div>
          <span>THIRUVONAM FINISH</span>
        </div>

        {/* BOT BOATS */}
        {bots.map((bot, index) => (
          <div
            key={bot.id}
            className={`bot-boat bot-${index + 1}`}
            style={{ bottom: `${bot.progress}%` }}
          >
            <div className="bot-label">{bot.name}</div>
            <div className="bot-vallam">
              <div className="bot-prow"></div>
              <div className="bot-body">
                {bot.rowers.map((rower, i) => (
                  <div key={i} className={`bot-rower ${rower.rowing ? "rowing" : ""}`}>
                    👤
                  </div>
                ))}
              </div>
              <div className="bot-stern"></div>
            </div>
          </div>
        ))}

        {/* PLAYER BOAT */}
        <div className={`player-boat ${zoomed ? "fixed-pos" : ""}`} style={zoomed ? {} : { bottom: `${playerProgress}%` }}>
          <div className="vallam-prow"></div>
          <div className="vallam-body">
            {/* Front row */}
            <div className="rower-pair front-pair">
              <div className={`rower-seat left ${rowers[0].rowing ? "active-row" : ""}`}>
                <button
                  className={`row-btn ${activeButton === 1 ? "beat-active" : ""}`}
                  onClick={() => rowBoat(rowers[0].id)}
                ></button>
                <div className="rower-person">👤</div>
              </div>
              <div className={`rower-seat right ${rowers[1].rowing ? "active-row" : ""}`}>
                <div className="rower-person">👤</div>
                <button
                  className={`row-btn ${activeButton === 2 ? "beat-active" : ""}`}
                  onClick={() => rowBoat(rowers[1].id)}
                ></button>
              </div>
            </div>
            {/* Back row */}
            <div className="rower-pair back-pair">
              <div className={`rower-seat left ${rowers[2].rowing ? "active-row" : ""}`}>
                <button
                  className={`row-btn ${activeButton === 3 ? "beat-active" : ""}`}
                  onClick={() => rowBoat(rowers[2].id)}
                ></button>
                <div className="rower-person">👤</div>
              </div>
              <div className={`rower-seat right ${rowers[3].rowing ? "active-row" : ""}`}>
                <div className="rower-person">👤</div>
                <button
                  className={`row-btn ${activeButton === 4 ? "beat-active" : ""}`}
                  onClick={() => rowBoat(rowers[3].id)}
                ></button>
              </div>
            </div>
          </div>
          <div className="vallam-stern"></div>
        </div>
      </div>

      {/* BEAT INDICATOR */}
      <div className={`beat-bar ${beatFlash ? "flash" : ""}`}>
        <div className="beat-text">TAP WHEN LIT!</div>
        <div className="streak-display">
          {streak > 0 && <span className="streak-fire">🔥 x{streak}</span>}
        </div>
      </div>

      {/* BOTTOM HUD */}
      <div className="bottom-panel">
        <div className="instruction">HIT THE BEAT!</div>
        <div className="sync-indicator">
          <span className={`sync-dot ${beatFlash ? "active" : ""}`}></span>
          SYNC
        </div>
      </div>
    </div>
  );
}

export default App;

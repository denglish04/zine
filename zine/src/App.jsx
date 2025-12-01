import { useState, useEffect, useRef } from 'react';
import './App.css';

// Sounds
const clickSound = new Audio('/sounds/click.mp3');
const flipSound = new Audio('/sounds/flip.mp3');
const victorySound = new Audio('/sounds/victory.mp3');
const failSound = new Audio('/sounds/fail.mp3');
const interfaceSound ='/sounds/interface.mp3'; // just a path, we’ll create a new Audio each time
const lockSound = '/sounds/lock.mp3';
const clockSound = 'public/sounds/clock.mp3';


function playInterface(){
    new Audio(interfaceSound).play();
}

function playLock(){
    new Audio(lockSound).play();
}

function playClock(){
    new Audio(clockSound).play();
}

// Bill Name Generator
function generateBillName() {   
 const subjects = [
  "WE HATE YOU PEOPLE",
  "THE COUNTRY CAN STARVE",
  "NO MORE RIGHTS",
  "WE TOOK YOUR MONEY",
  "BIG TECH NEEDS MORE CASH",
  "SCREW THE POOR",
  "FREEDOM OPTIONAL",
  "THE PLEASE STOP HAVING RIGHTS",
  "THE DON'T EAT NEXT TUESDAY",
  "ALL HAIL THE CEO",
  "NATIONAL SLEEP RESTRICTION",
  "SNEEZING IS ILLEGAL",
  "THE GRAND PRIVILEGE ACT",
  "MONEY FOR US, NOTHING FOR YOU",
  "EVERYONE MUST WORK FOR FREE",
];

const verbs = [
  "ACT",
  "BILL",
  "INITIATIVE",
  "POWER GRAB PACKAGE",
  "EMERGENCY MEASURE",
  "TAX BREAK EXPANSION",
  "PRIVILEGE ENHANCEMENT",
  "PROSPERITY FOR THE 1%",
  "CONSOLIDATION STATUTE",
  "REVENUE INJECTION",
  "MANDATORY HUGS FOR BOSSES",
  "INTERNET USAGE RESTRICTION",
  "TOTAL DOMINATION PLAN",
  "COMPLETE OPPRESSION AMENDMENT"
];

const extras = [
  "+ MORE TAX BREAKS FOR BIG TECH",
  "+ ZERO COMPASSION AMENDMENT",
  "+ EXTREME ECONOMIC STREAMLINE",
  "+ SUPER CORPORATE LOVING CLAUSE",
  "+ OPTIONAL HUMANITY ADDENDUM",
  "+ SECRET ROBOT BONUS",
  "+ UNNECESSARY SURVEILLANCE ADDON",
  "+ MONOPOLY EXPANSION PROVISION",
  "+ EXTRA FEES FOR BREATHING",
  "+ SLOW WALKING ENFORCEMENT"
];



  const a = subjects[Math.floor(Math.random() * subjects.length)];
  const b = verbs[Math.floor(Math.random() * verbs.length)];
  const maybeExtra = Math.random() < 0.55 ? ` ${extras[Math.floor(Math.random() * extras.length)]}` : "";
  return `${a} ${b}${maybeExtra}`;} // keep your original

// Square Component
function Square({ id, value, onClick, locked }) {
  const [shake, setShake] = useState(false);
  const [bubble, setBubble] = useState(null);

  const background = locked
    ? 'hsl(120, 70%, 50%)' // green
    : `hsl(0, 100%, ${value * 5}%)`; // red gradient

  function handleClick() {
    if (locked) return;
    new Audio('/sounds/click.mp3').play();

    setShake(true);
    setBubble("+1");
    onClick(id);
    setTimeout(() => setShake(false), 150);
    setTimeout(() => setBubble(null), 600);
  }

  return (
    <div className={`square ${shake ? 'shake' : ''}`} style={{ background }} onClick={handleClick}>
      {value}
      {bubble && <span className="bubble">{bubble}</span>}
    </div>
  );
}

// Sprinkles Component
function Sprinkles({ count = 50, containerWidth = 600, containerHeight = 400 }) {
  const [sprinkles] = useState(
    Array.from({ length: count }).map(() => ({
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      rotation: Math.random() * 360,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2
    }))
  );

  return (
    <>
      {sprinkles.map((s, idx) => (
        <img
          key={idx}
          src="../public/money.png"
          alt="sprinkle"
          className="sprinkle"
          style={{
            left: s.x,
            top: s.y,
            transform: `rotate(${s.rotation}deg)`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
    </>
  );
}

// Grid Component
function Grid({ squares, onClick }) {
  return (
    <div className="grid">
      {squares.map((sq, i) => (
        <Square
          key={i}
          id={i}
          value={sq.value}
          locked={sq.locked}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

// --------------------- App ---------------------
export default function App() {
  const TOTAL_TIME = 60;
  const THRESHOLD = 1 / 3;

  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showGame, setShowGame] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [billName, setBillName] = useState(generateBillName());

  const [votesYes, setVotesYes] = useState(75);
  const [votesNo, setVotesNo] = useState(0);
  const [lockCount, setLockCount] = useState(3);

  const [slideInTriggered, setSlideInTriggered] = useState(false);
  const [squares, setSquares] = useState(
    Array.from({ length: 75 }, () => ({ value: 0, locked: false }))
  );

  const gridRef = useRef(null);
  const buybackChance = 0.5;

  // --------------------- Clock Sound ---------------------
  const clockSound = useRef(new Audio('/sounds/clock.mp3'));
  const [roundStart, setRoundStart] = useState(false);
  const music = useRef(new Audio('/sounds/music.mp3'));

  useEffect(() => {
    if (!roundStart) return;
    clockSound.current.loop = true;
    music.current.loop = true;
    clockSound.current.play().catch(() => {});
    music.current.play().catch(() => {});
    return () => {
      clockSound.current.pause();
      music.current.play().catch(() => {});
      clockSound.current.currentTime = 0;
      music.current.currentTime = 0;
    };
  }, [roundStart]);

  // --------------------- Handle Square Click ---------------------
  const handleSquareClick = (id) => {
    setSquares(prev => {
      const sq = prev[id];
      if (sq.locked || sq.value >= 10) return prev;

      const newSquares = prev.map((s, i) =>
        i === id ? { ...s, value: s.value + 1 } : s
      );

      if (sq.value === 9) {
        flipSound.play();
        setVotesNo(v => v + 1);
        setVotesYes(v => v - 1);
      }

      return newSquares;
    });
  };

  // --------------------- Timer + Square Locking + Sprinkles ---------------------
  useEffect(() => {
    if (!showGame || fadeOut || !roundStart) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeLeft(0);

          // Stop clock immediately
          clockSound.current.pause();
          clockSound.current.currentTime = 0;

          // Check victory/defeat
          if (votesNo >= 75 * THRESHOLD) {
            victorySound.play();
            setShowVictory(true);
          } else {
            failSound.play();
            setGameOver(true);
          }

          return 0;
        }

        const nextTime = prev - 1;

        // Trigger sprinkles/photo at 30s
        if (!slideInTriggered && nextTime <= 30) {
          setSlideInTriggered(true);
        }

        // Lock squares every 10s after 30s
        if (nextTime <= 30 && nextTime % 10 === 0) {
          playLock();
          setSquares(prevSquares => {
            const updated = [...prevSquares];
            const redIndices = updated
              .map((sq, idx) => (!sq.locked && sq.value === 10 ? idx : null))
              .filter(i => i !== null);

            for (let i = 0; i < lockCount && redIndices.length > 0; i++) {
              const randIdx = redIndices.splice(Math.floor(Math.random() * redIndices.length), 1)[0];
              updated[randIdx] = { ...updated[randIdx], locked: true };
              setVotesYes(v => v + 1);
              setVotesNo(v => v - 1);
            }

            return updated;
          });
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showGame, fadeOut, slideInTriggered, lockCount, votesNo, votesYes, roundStart]);

  // --------------------- Round Control ---------------------
  const startRound = () => {
    setVotesYes(75);
    setVotesNo(0);
    setTimeLeft(TOTAL_TIME);
    setSquares(Array.from({ length: 75 }, () => ({ value: 0, locked: false })));
    setSlideInTriggered(false);
    setRoundStart(false); // reset before starting
    setTimeout(() => setRoundStart(true), 10); // trigger clock sound
  };

  const handleNextRound = () => {
    setShowVictory(false);
    setLockCount(prev => prev + 1);
    setRound(prev => prev + 1);
    startRound();
  };

  const handleGameOver = () => {
    setGameOver(false);
    setShowGame(false);
    setRound(1);
    setBillName(generateBillName());
    startRound(); // reset clock/squares for restart
  };

  // --------------------- Initial Round ---------------------
  useEffect(() => {
    if (showGame) startRound();
  }, [showGame]);

  // --------------------- Render ---------------------
  return (
    <>
      {!showGame && !showIntro && !showVictory && !gameOver && (
        <button className="play-button" onClick={() => { playInterface(); setShowIntro(true)}}>Play</button>
      )}

      {showIntro && (
        <div className="overlay">
          <div className="popup popup-slide-in">
            <p>
              🚨 <strong>Breaking News</strong> 🚨<br /><br />
              The BIG TECH CEO has introduced the <strong>{billName}</strong>.<br /><br />
              Convince enough representatives to vote <strong>NO</strong> by clicking on them.
            </p>
            <button onClick={() => { playInterface(); setShowIntro(false); setShowGame(true); }}>Begin</button>
          </div>
        </div>
      )}

      {showGame && !fadeOut && (
        <div className="game-container">
          <h2>Voting on the: {billName}, bill </h2>
          <div className="timer">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="votes">Yes: {votesYes} | No: {votesNo}</div>

          <div className="progress-wrapper">
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${(votesNo / 75) * 100}%` }} />
              <div className="threshold-line" />
            </div>
            <div className="threshold-label">Bill fails here (1/3)</div>
          </div>

          <div className="grid-container" ref={gridRef} style={{ position: 'relative' }}>
            <Grid squares={squares} onClick={handleSquareClick} />
            {slideInTriggered && (
              <Sprinkles
                count={60}
                containerWidth={gridRef.current?.offsetWidth || 600}
                containerHeight={gridRef.current?.offsetHeight || 400}
              />
            )}
            {slideInTriggered && (
              <img
                src="/bigtechlobbying.png"
                alt="Top Right"
                className="top-right-photo slide-in"
              />
            )}
          </div>
        </div>
      )}

      {showVictory && (
        <div className="overlay">
          <div className="popup popup-victory">
            💥 BILL DEFEATED! 💥 <br />
            Round {round} complete. <br />
            However, the BIG TECH CEO swapped one word for another and the bill is somehow back on the floor for a vote.
            <br />
            <button onClick={() => { playInterface(); handleNextRound(); }}>Next Round</button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="overlay">
          <div className="popup popup-gameover">
            ❌ GAME OVER ❌<br />
            The bill passed. WE ARE DOOMED
            <br />
            <button onClick={() => { playInterface(); handleGameOver(); }}>Back to Home</button>
          </div>
        </div>
      )}
    </>
  );
}


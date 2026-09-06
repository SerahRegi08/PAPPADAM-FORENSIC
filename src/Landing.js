import React from 'react'
import './Landing.css'

function Landing({ onStart }) {
  return (
    <div className="landing">
      <div className="caution-top"></div>

      <div className="landing-content">

        <div className="badge">
          <span className="badge-icon">🔍</span>
          <span className="badge-text">CLASSIFIED</span>
        </div>

        <h1 className="title">
          PAPPADAM <br/> FORENSIC
        </h1>

        <p className="tagline">
          Analyzing Pappadam Crimes Since 2024
        </p>

        <div className="evidence-box">
          <div className="evidence-label">CASE FILE #001</div>
          <div className="evidence-icon">🕵️</div>
          <div className="evidence-status">AWAITING EVIDENCE</div>
        </div>

        <button className="start-btn" onClick={onStart}>
          <span className="btn-icon">🔬</span>
          BEGIN INVESTIGATION
        </button>

        <div className="footer-warn">
          ⚠️ EVIDENCE UPLOAD AREA ⚠️
        </div>

      </div>

      <div className="caution-bottom"></div>
    </div>
  )
}

export default Landing

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { onValue, ref, set } from 'firebase/database'
import { quizData } from './quizData'
import { auth, database } from './firebase'

const states = [
  ['Lakshadweep', 'lakshadweep.jpg', 'Lakshadweep.html'],
  ['Chandigarh', 'Chandigarh.jpg', 'Chandigarh.html'],
  ['Puducherry', 'Puducherry.jpg', 'Puducherry.html'],
  ['Dadra and Nagar Haveli and Daman and Diu', 'DadraHaveli.jpg', 'DadraAndNagarHaveliAndDamanAndDiu.html'],
  ['Delhi', 'delhi.jpg', 'Delhi.html'],
  ['Andaman and Nicobar', 'andamanandnicobar.jpg', 'AndamanAndNicobar.html'],
  ['Jammu and Kashmir', 'jammuAndKashmir.jpg', 'JammuAndKashmir.html'],
  ['Ladakh', 'ladakh.jpg', 'Ladakh.html'],
  ['Goa', 'goa.jpg', 'Goa.html'],
  ['Sikkim', 'sikkim.jpg', 'Sikkim.html'],
  ['Tripura', 'tripura.png', 'Tripura.html'],
  ['Nagaland', 'nagaland.jpg', 'Nagaland.html'],
  ['Mizoram', 'mizoram.jpg', 'Mizoram.html'],
  ['Manipur', 'manipur.jpg', 'Manipur.html'],
  ['Meghalaya', 'meghalaya.jpg', 'Meghalaya.html'],
  ['Kerala', 'kerala.jpg', 'Kerala.html'],
  ['Haryana', 'haryana.jpg', 'Haryana.html'],
  ['Punjab', 'Punjab.jpg', 'Punjab.html'],
  ['Uttarakhand', 'uttarakhand.jpg', 'Uttarakhand.html'],
  ['Himachal Pradesh', 'himachalPradesh.jpg', 'HimachalPradesh.html'],
  ['Assam', 'assam.jpg', 'Assam.html'],
  ['Jharkhand', 'jharkhand.jpg', 'Jharkhand.html'],
  ['Arunachal Pradesh', 'arunachalPradesh.jpg', 'ArunachalPradesh.html'],
  ['West Bengal', 'westBengal.jpg', 'WestBengal.html'],
  ['Bihar', 'bihar.jpg', 'Bihar.html'],
  ['Telangana', 'telangana.jpg', 'Telangana.html'],
  ['Tamil Nadu', 'tamilNadu.jpg', 'TamilNadu.html'],
  ['Chhattisgarh', 'chattisgarh.jpg', 'Chattisgarh.html'],
  ['Odisha', 'odisha.jpg', 'Odisha.html'],
  ['Andhra Pradesh', 'andhraPradesh.jpg', 'AndhraPradesh.html'],
  ['Karnataka', 'karnataka.jpg', 'Karnataka.html'],
  ['Gujarat', 'gujrat.jpg', 'Gujrat.html'],
  ['Uttar Pradesh', 'UP.jpg', 'UttarPradesh.html'],
  ['Maharashtra', 'Maharastra.jpg', 'Maharashtra.html'],
  ['Madhya Pradesh', 'madhyaPradesh.jpg', 'MadhyaPradesh.html'],
  ['Rajasthan', 'rajasthan.jpg', 'Rajasthan.html'],
]

const performanceKey = (username) => `pocket-india-performance:${username}`

function Header() {
  const loggedIn = Boolean(auth.currentUser)
  return <nav className="topbar">
    <a className="brand" href="/"><span className="brand-mark">PI</span><span>Pocket India</span></a>
    <div className="nav-actions"><a className="nav-link" href={loggedIn ? '/?page=dashboard' : '/#explore'}>{loggedIn ? 'Dashboard' : 'Explore'}</a>{loggedIn ? <button className="nav-link nav-button" onClick={() => { signOut(auth); window.location.assign('/') }}>Log out ↗</button> : <a className="nav-link" href="/?page=login">Log in <span aria-hidden="true">↗</span></a>}</div>
  </nav>
}

function Footer() {
  return <footer><span>POCKET INDIA © 2024</span><span>Made for curious people <b>✦</b></span></footer>
}

function Explorer() {
  const [query, setQuery] = useState('')
  const [activeRegion, setActiveRegion] = useState('All')
  const filteredStates = useMemo(() => states.filter(([name]) => {
    const regions = {
      North: ['Chandigarh', 'Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand'],
      South: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry', 'Lakshadweep'],
      East: ['Bihar', 'Chhattisgarh', 'Jharkhand', 'Odisha', 'Sikkim', 'West Bengal'],
      West: ['Goa', 'Gujarat', 'Madhya Pradesh', 'Maharashtra', 'Dadra and Nagar Haveli and Daman and Diu'],
    }
    return name.toLowerCase().includes(query.trim().toLowerCase()) && (activeRegion === 'All' || regions[activeRegion].includes(name))
  }), [activeRegion, query])

  const exploreHref = auth.currentUser ? '/?page=dashboard' : '/?page=login'
  return <><Header /><section className="hero"><div className="hero-copy"><p className="eyebrow">36 places · one pocket guide</p><h1>India is<br /><span>your playground.</span></h1><p className="hero-text">A tiny, loud, delightfully useful guide to the places that make India impossible to forget.</p><a className="button button-dark" href={exploreHref}>Start exploring <span>↓</span></a></div><div className="hero-art"><div className="sun">NAMASTE<br />WORLD</div><img src="/India.png" alt="Illustration of the map of India" /><div className="sticker">NO<br />BORING<br />TRIPS</div></div></section>
    <section className="explore" id="explore"><div className="section-heading"><div><p className="eyebrow">Pick a pin</p><h2>Where to next?</h2></div><p className="count">{filteredStates.length} / {states.length} destinations</p></div><div className="controls"><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a state or territory" /></label><div className="filters">{['All', 'North', 'South', 'East', 'West'].map((region) => <button className={activeRegion === region ? 'filter active' : 'filter'} key={region} onClick={() => setActiveRegion(region)}>{region}</button>)}</div></div><div className="state-grid">{filteredStates.map(([name, image, href], index) => <a className="state-card" href={`/?page=quiz&state=${encodeURIComponent(name)}`} key={name}><img src={`/${image}`} alt="" /><span className="card-overlay" /><span className="card-number">{String(index + 1).padStart(2, '0')}</span><span className="card-name">{name}</span><span className="card-arrow">↗</span></a>)}</div>{filteredStates.length === 0 && <p className="empty">No places found. Try a different search.</p>}</section><Footer /></>
}

function Dashboard() {
  const user = auth.currentUser
  const [username, setUsername] = useState(user?.displayName || 'explorer')
  const [level, setLevel] = useState(1)
  const [databaseError, setDatabaseError] = useState('')
  const [performances, setPerformances] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(performanceKey(user?.uid || 'guest')) || '[]')
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return undefined
    const userRef = ref(database, `Users/${user.uid}`)
    return onValue(userRef, (snapshot) => {
      const profile = snapshot.val() || {}
      setUsername(profile.username || user.displayName || 'explorer')
      setLevel(Number(profile.levels) || 1)
      const databasePerformances = profile.performances ? Object.values(profile.performances) : []
      if (databasePerformances.length) {
        setPerformances(databasePerformances.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt)))
        localStorage.setItem(performanceKey(user.uid), JSON.stringify(databasePerformances))
      }
      setLoading(false)
    }, () => {
      setDatabaseError('Saved performances could not be loaded from Firebase. Showing local history.')
      setLoading(false)
    })
  }, [user])

  const average = performances.length
    ? Math.round(performances.reduce((total, item) => total + item.percentage, 0) / performances.length)
    : 0

  return <><Header /><main className="dashboard-page"><section className="dashboard-heading"><div><p className="eyebrow">Your pocket / dashboard</p><h1>Keep going,<br /><span>{username}.</span></h1><p className="hero-text">Your map is getting bigger with every question.</p></div><div className="dashboard-stats"><div><strong>{performances.length}</strong><span>quizzes played</span></div><div><strong>{average}%</strong><span>average score</span></div><div><strong>{level}</strong><span>current level</span></div></div></section><section className="levels-section"><div className="section-heading"><div><p className="eyebrow">The full map</p><h2>Choose a level.</h2></div><p className="count">{Math.min(level, states.length)} / {states.length} unlocked</p></div><div className="level-grid">{states.map(([name, image], index) => { const destination = quizData[name]; const unlocked = destination && destination.level <= level; return <a className={unlocked ? 'level-card' : 'level-card locked'} href={unlocked ? `/?page=quiz&state=${encodeURIComponent(name)}` : undefined} aria-disabled={!unlocked} key={name}><img src={`/${image}`} alt="" /><span className="level-overlay" /><span className="level-number">{String(index + 1).padStart(2, '0')}</span><span className="level-name">{name}</span><span className="level-status">{unlocked ? 'Play ↗' : 'Locked'}</span></a> })}</div></section><section className="performance-section"><div className="section-heading"><div><p className="eyebrow">Your trail</p><h2>Past performances.</h2></div></div>{databaseError && <p className="form-error">{databaseError}</p>}{loading ? <div className="empty performance-empty">Loading your saved performances...</div> : performances.length ? <div className="performance-list">{performances.slice().reverse().map((item) => <div className="performance-row" key={item.id}><div><strong>{item.state}</strong><span>{new Date(item.completedAt).toLocaleDateString()}</span></div><span>{item.score} / {item.total}</span><b>{item.percentage}%</b></div>)}</div> : <div className="empty performance-empty">Complete your first quiz and your score will appear here.</div>}</section></main><Footer /></>
}

function AuthPage({ signup = false }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const username = String(form.get('username')).trim()
    const email = String(form.get('email')).trim()
    const password = String(form.get('password'))
    try {
      if (signup) {
        if (!/^[A-Za-z0-9_]+$/.test(username)) throw new Error('Use only letters, numbers, and underscores in your username.')
        if (password !== form.get('confirm')) throw new Error('Your passwords do not match.')
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        await set(ref(database, `Users/${credential.user.uid}`), { username, levels: 1 })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setSubmitted(true)
      window.location.assign('/?page=dashboard')
    } catch (submissionError) {
      const code = submissionError?.code
      const messages = {
        'auth/email-already-in-use': 'That email is already registered.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/weak-password': 'Use a password with at least six characters.',
        'auth/invalid-email': 'Enter a valid email address.',
      }
      setError(messages[code] || (submissionError instanceof Error ? submissionError.message : 'Something went wrong. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return <><Header /><main className="auth-page"><div className="auth-art"><p className="eyebrow">Pocket India / {signup ? '02' : '01'}</p><h1>{signup ? 'Make room<br /><span>for wonder.</span>' : 'Welcome<br /><span>back, explorer.</span>'}</h1><p>{signup ? 'Create your pocket-sized passport to India.' : 'Your next bright idea for a trip is waiting.'}</p></div><form className="auth-card" onSubmit={submit}><p className="eyebrow">{signup ? 'New account' : 'Member login'}</p><h2>{signup ? 'Join the club.' : 'Sign in.'}</h2>{signup && <label>Username<input name="username" required placeholder="your name" /></label>}<label>Email<input name="email" type="email" required placeholder="you@example.com" /></label><label>Password<input name="password" type="password" required placeholder="••••••••" /></label>{signup && <label>Confirm password<input name="confirm" type="password" required placeholder="••••••••" /> </label>}{error && <p className="form-error">{error}</p>}{submitted && <p className="form-message">You are all set. Let’s explore.</p>}<button className="button button-dark" disabled={busy} type="submit">{busy ? 'Checking...' : signup ? 'Create account ↗' : 'Enter Pocket India ↗'}</button><p className="switch">{signup ? 'Already a member?' : 'New here?'} <a href={`/?page=${signup ? 'login' : 'signup'}`}>{signup ? 'Log in' : 'Create an account'}</a></p></form></main><Footer /></>
}

function Quiz({ stateName }) {
  const destination = states.find(([name]) => name === stateName) || states[0]
  const data = quizData[destination[0]]
  const questions = data?.questions || []
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [performanceError, setPerformanceError] = useState('')
  const saved = useRef(false)
  const loggedIn = Boolean(auth.currentUser)
  const finished = current >= questions.length
  const question = questions[current]
  const answer = (index) => { if (selected !== null) return; setSelected(index); if (index === question.correct) setScore((value) => value + 1) }
  useEffect(() => {
    if (!finished || saved.current || !questions.length) return
    const user = auth.currentUser
    if (!user) return
    const record = { id: `${Date.now()}-${destination[0]}`, state: destination[0], score, total: questions.length, percentage: Math.round(score / questions.length * 100), completedAt: new Date().toISOString() }
    const key = performanceKey(user.uid)
    let history = []
    try { history = JSON.parse(localStorage.getItem(key) || '[]') } catch { history = [] }
    localStorage.setItem(key, JSON.stringify([...history, record]))
    set(ref(database, `Users/${user.uid}/performances/${record.id}`), record).catch(() => {
      setPerformanceError('This result is cached locally, but could not be synced to Firebase.')
    })
    saved.current = true
  }, [destination, finished, questions.length, score])
  if (!loggedIn) return <><Header /><main className="auth-page login-required"><div className="auth-art"><p className="eyebrow">Members only / destination quiz</p><h1>Log in<br /><span>to unlock.</span></h1><p>Questions and answers are reserved for registered explorers.</p></div><div className="auth-card"><h2>Ready to play?</h2><p className="hero-text">Sign in to access the original {destination[0]} quiz and keep your progress.</p><a className="button button-dark" href="/?page=login">Log in to continue ↗</a><p className="switch">New here? <a href="/?page=signup">Create an account</a></p></div></main><Footer /></>
  if (finished) return <><Header /><main className="result-page"><p className="eyebrow">Quiz complete / {destination[0]}</p><h1>You got<br /><span>{score} / {questions.length}.</span></h1><p className="hero-text">Every right answer is another little piece of India in your pocket.</p><div className="result-stat"><strong>{Math.round(score / questions.length * 100)}%</strong><span>curiosity unlocked</span></div>{performanceError && <p className="form-error">{performanceError}</p>}<a className="button button-dark" href="/?page=dashboard">Back to dashboard ↗</a></main><Footer /></>
  return <><Header /><main className="quiz-page"><div className="quiz-intro"><p className="eyebrow">Destination quiz / {String(current + 1).padStart(2, '0')} of {questions.length}</p><h1>How well do<br /><span>you know {destination[0]}?</span></h1><img src={`/${destination[1]}`} alt="" /></div><div className="quiz-card"><p className="question-count">Question {current + 1}</p><h2>{question.question}</h2><div className="answers">{question.answers.map((answerText, index) => <button className={selected === index ? (index === question.correct ? 'answer correct' : 'answer wrong') : 'answer'} key={answerText} onClick={() => answer(index)}><span>{String.fromCharCode(65 + index)}</span>{answerText}</button>)}</div>{selected !== null && <button className="button button-dark next-button" onClick={() => { setCurrent((value) => value + 1); setSelected(null) }}>{current === questions.length - 1 ? 'See result ↗' : 'Next question ↗'}</button>}</div></main><Footer /></>
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const page = params.get('page')
  const [user, setUser] = useState(undefined)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  if (user === undefined) return <div className="app-loading">Loading Pocket India...</div>
  if (page === 'login') return <AuthPage />
  if (page === 'signup') return <AuthPage signup />
  if (page === 'dashboard') return user ? <Dashboard /> : <AuthPage />
  if (page === 'quiz') return <Quiz stateName={params.get('state')} />
  return <Explorer />
}

export default App

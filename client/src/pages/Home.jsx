import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import {
  ArrowRight, CalendarBlank, CheckCircle, FileLock, Heartbeat,
  MagnifyingGlass, ShieldCheck, Stethoscope,
} from '@phosphor-icons/react';

const specializations = [
  { name: 'General Practice', description: 'Everyday concerns and first assessments', icon: Stethoscope },
  { name: 'Cardiology', description: 'Heart and circulation care', icon: Heartbeat },
  { name: 'Dermatology', description: 'Skin, hair, and nail care', icon: ShieldCheck },
  { name: 'Pediatrics', description: 'Care for children and teens', icon: CheckCircle },
];

const bookingSteps = [
  { number: '01', title: 'Search', copy: 'Compare verified doctors by specialty, location, and working day.', icon: MagnifyingGlass },
  { number: '02', title: 'Request', copy: 'Choose a published time and attach a supporting document when needed.', icon: CalendarBlank },
  { number: '03', title: 'Stay informed', copy: 'Track confirmations, reminders, changes, and consultation notes.', icon: CheckCircle },
];

const currentYear = new Date().getFullYear();

const HomePage = () => (
  <div className="home-page">
    <section className="home-hero">
      <Container className="home-hero-grid">
        <div className="home-hero-copy">
          <span className="editorial-rule" aria-hidden="true" />
          <h1>Care, <em>without</em><br />the runaround.</h1>
          <p className="hero-lead">Verified care. Clear scheduling.</p>
          <p className="hero-support">Find the right doctor, request a time, and keep every appointment update in one calm place.</p>
          <div className="hero-actions">
            <Button as={Link} to="/doctors" variant="primary" size="lg">
              Find a doctor <span className="button-orb"><ArrowRight aria-hidden="true" /></span>
            </Button>
            <a href="#how-it-works" className="editorial-link">How DOCVIA works</a>
          </div>
        </div>

        <div className="hero-media">
          <img src="/hero-image.jpg" alt="Doctor in a bright modern clinic" width="720" height="620" fetchPriority="high" />
          <div className="hero-status-card">
            <span aria-hidden="true" />
            <div><strong>Appointments available</strong><small>Browse current doctor schedules</small></div>
          </div>
        </div>
      </Container>
    </section>

    <section className="trust-strip" aria-label="Why patients use DOCVIA">
      <Container className="trust-grid">
        <p><strong>Verified professionals</strong><span>Every listed doctor is reviewed by an administrator.</span></p>
        <p><strong>Real schedules</strong><span>Available times come from each doctor's published hours.</span></p>
        <p><strong>Private by design</strong><span>Documents stay limited to you and your assigned doctor.</span></p>
      </Container>
    </section>

    <section className="home-section specialties-section">
      <Container>
        <div className="section-editorial-head">
          <div><span className="section-index">01 / Find care</span><h2>A clearer place<br />to begin.</h2></div>
          <p>Start with a specialty, or choose general practice when you want help deciding what kind of care you need.</p>
        </div>
        <div className="specialty-list">
          {specializations.map(({ name, description, icon: Icon }, index) => (
            <Link key={name} to={`/doctors?specialization=${encodeURIComponent(name)}`} className="specialty-link">
              <span className="specialty-number">0{index + 1}</span>
              <span className="specialty-icon"><Icon aria-hidden="true" weight="regular" /></span>
              <span className="specialty-copy"><strong>{name}</strong><small>{description}</small></span>
              <ArrowRight className="specialty-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Container>
    </section>

    <section id="how-it-works" className="home-section booking-section">
      <Container>
        <div className="section-editorial-head section-editorial-head-light">
          <div><span className="section-index">02 / How it works</span><h2>From search to<br />scheduled.</h2></div>
          <p>DOCVIA keeps the practical details together, so you spend less time chasing updates and more time preparing for care.</p>
        </div>
        <div className="booking-steps">
          {bookingSteps.map(({ number, title, copy, icon: Icon }) => (
            <article key={title}>
              <span className="step-number">{number}</span>
              <span className="step-icon"><Icon aria-hidden="true" weight="regular" /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>

    <section className="home-section care-proof-section">
      <Container className="care-proof-grid">
        <div className="care-proof-image" aria-hidden="true">
          <img src="/images/care-consultation.webp" alt="" loading="lazy" width="1600" height="686" />
        </div>
        <div className="care-proof-copy">
          <span className="section-index">03 / Built for trust</span>
          <blockquote>“The next step should always be clear before, during, and after an appointment.”</blockquote>
          <div className="proof-points">
            <p><ShieldCheck aria-hidden="true" /><span><strong>Reviewed listings</strong>Only approved doctor profiles appear in search.</span></p>
            <p><FileLock aria-hidden="true" /><span><strong>Controlled records</strong>Appointment documents are not publicly accessible.</span></p>
            <p><CalendarBlank aria-hidden="true" /><span><strong>Traceable changes</strong>Reschedules and status updates stay visible in history.</span></p>
          </div>
          <Button as={Link} to="/privacy" variant="outline-primary">Read our privacy approach</Button>
        </div>
      </Container>
    </section>

    <section className="home-cta">
      <Container className="cta-panel">
        <div><span className="section-index">Start here</span><h2>Find care that fits your life.</h2></div>
        <div><p>Browse first. Create an account when you are ready to request an appointment.</p><Button as={Link} to="/doctors" variant="primary" size="lg">Explore doctors <span className="button-orb"><ArrowRight /></span></Button></div>
      </Container>
    </section>

    <footer className="site-footer">
      <Container className="site-footer-grid">
        <div><strong>DOCVIA</strong><span>Care, made clear.</span></div>
        <nav aria-label="Footer navigation"><Link to="/doctors">Find doctors</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/login">Sign in</Link></nav>
        <small>© {currentYear} DOCVIA</small>
      </Container>
    </footer>
  </div>
);

export default HomePage;

import { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Warning as FaExclamationTriangle, House as FaHome, ArrowClockwise as FaRedo } from '@phosphor-icons/react';

class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('DOCVIA render error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-page app-fatal-error">
        <Container className="empty-page text-center">
          <span className="empty-state-icon"><FaExclamationTriangle aria-hidden="true" /></span>
          <h1 className="page-title mx-auto">This page could not be displayed</h1>
          <p className="text-muted mx-auto">Reload the page to try again. Your saved account data is not affected.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            <Button onClick={() => window.location.reload()}><FaRedo className="me-2" />Reload page</Button>
            <Button variant="outline-primary" onClick={() => window.location.assign('/')}><FaHome className="me-2" />Go home</Button>
          </div>
        </Container>
      </main>
    );
  }
}

export default AppErrorBoundary;

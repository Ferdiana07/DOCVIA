import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import { ArrowLeft as FaArrowLeft, MagnifyingGlass as FaSearch } from '@phosphor-icons/react';

const NotFound = () => (
  <div className="app-page d-flex align-items-center">
    <Container className="empty-page text-center">
      <span className="section-kicker">Page not found</span>
      <h1 className="display-title mt-3">This page is not available.</h1>
      <p className="text-muted mx-auto">The address may be incorrect, or the page may have moved.</p>
      <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
        <Button as={Link} to="/" variant="primary"><FaArrowLeft className="me-2" />Go home</Button>
        <Button as={Link} to="/doctors" variant="outline-primary"><FaSearch className="me-2" />Find a doctor</Button>
      </div>
    </Container>
  </div>
);

export default NotFound;

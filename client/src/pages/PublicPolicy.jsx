import { useEffect, useState } from 'react';
import { Alert, Card, Container, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const PublicPolicy = () => {
  const { pathname } = useLocation();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/settings/public').then(({ data }) => setSettings(data.data)).catch(() => setError('This notice is temporarily unavailable.')); }, []);
  const privacy = pathname === '/privacy';
  return <div className="app-page"><Container className="py-5 policy-page"><span className="section-kicker">DOCVIA governance</span><h1 className="page-title mt-2">{privacy ? 'Privacy notice' : 'Terms and safety notice'}</h1>{error && <Alert variant="danger">{error}</Alert>}{!settings && !error ? <div className="page-loading"><Spinner /><span>Loading notice...</span></div> : settings && <Card className="content-card"><Card.Body className="p-4 p-lg-5"><p className="lead mb-4">{privacy ? settings.privacyNotice : settings.termsNotice}</p>{privacy ? <><h2 className="h5 fw-bold">Who can see medical information?</h2><p>Medical profile details are returned only to the account owner and to the doctor assigned to an appointment. Administrators receive operational account fields, not the patient medical profile.</p><h2 className="h5 fw-bold mt-4">Documents</h2><p className="mb-0">Uploaded appointment documents require authentication and ownership checks before download.</p></> : <><h2 className="h5 fw-bold">Emergency care</h2><p>DOCVIA is an appointment coordination service. For an emergency, contact local emergency services or visit the nearest emergency department.</p><h2 className="h5 fw-bold mt-4">Account responsibility</h2><p className="mb-0">Keep your contact and health information accurate and never share your password or access token.</p></>}</Card.Body></Card>}</Container></div>;
};

export default PublicPolicy;

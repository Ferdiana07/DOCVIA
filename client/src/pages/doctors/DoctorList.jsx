import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, Container, Form, Spinner } from 'react-bootstrap';
import {
  ArrowRight, CalendarBlank, FunnelSimple, MagnifyingGlass, MapPin,
  Stethoscope, UserCircle,
} from '@phosphor-icons/react';
import api from '../../services/api';
import { getDoctorImage } from '../../utils/doctorImage';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    specialization: searchParams.get('specialization') || '',
    location: searchParams.get('location') || '',
    availableDay: searchParams.get('availableDay') || '',
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [specializationResponse, locationResponse] = await Promise.all([
          api.get('/doctors/specializations'), api.get('/doctors/locations'),
        ]);
        setSpecializations(specializationResponse.data.data || []);
        setLocations(locationResponse.data.data || []);
      } catch {
        // Text search remains available when optional metadata cannot be loaded.
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError('');
      try {
        const params = Object.fromEntries(
          Object.entries({
            search: searchParams.get('search') || '',
            specialization: searchParams.get('specialization') || '',
            location: searchParams.get('location') || '',
            availableDay: searchParams.get('availableDay') || '',
          }).filter(([, value]) => value)
        );
        const { data } = await api.get('/doctors', { params });
        setDoctors(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'We could not load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [searchParams, retryKey]);

  const handleChange = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));

  const applyFilters = (event) => {
    event.preventDefault();
    setSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)));
  };

  const clearFilters = () => {
    const empty = { search: '', specialization: '', location: '', availableDay: '' };
    setFilters(empty);
    setSearchParams({});
  };

  const selectSpecialization = (specialization) => {
    const next = { ...filters, specialization };
    setFilters(next);
    setSearchParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value)));
  };

  const hasFilters = [...searchParams.values()].some(Boolean);

  return (
    <div className="app-page directory-page">
      <section className="directory-hero">
        <Container>
          <div className="directory-intro">
            <span className="section-index">Verified care</span>
            <h1>Find care that<br /><em>fits your life.</em></h1>
            <p>Compare specialties, clinic locations, schedules, and consultation fees before you request a visit.</p>
          </div>

          <Form onSubmit={applyFilters} className="doctor-filter-panel" aria-label="Doctor search filters">
            <div className="directory-field directory-field-search">
              <Form.Label htmlFor="doctor-search">Doctor or specialization</Form.Label>
              <div className="field-with-icon"><MagnifyingGlass aria-hidden="true" /><Form.Control id="doctor-search" name="search" value={filters.search} onChange={handleChange} placeholder="Search by name or specialty" /></div>
            </div>
            <div className="directory-field">
              <Form.Label htmlFor="location-filter">Location</Form.Label>
              <div className="field-with-icon"><MapPin aria-hidden="true" /><Form.Control id="location-filter" name="location" value={filters.location} onChange={handleChange} list="doctor-locations" placeholder="City or clinic" /></div>
              <datalist id="doctor-locations">{locations.map((location) => <option key={location} value={location} />)}</datalist>
            </div>
            <div className="directory-field">
              <Form.Label htmlFor="specialization-filter">Specialization</Form.Label>
              <Form.Select id="specialization-filter" name="specialization" value={filters.specialization} onChange={handleChange}>
                <option value="">All specialties</option>
                {specializations.map((item) => <option key={item} value={item}>{item}</option>)}
              </Form.Select>
            </div>
            <div className="directory-field">
              <Form.Label htmlFor="day-filter">Availability</Form.Label>
              <Form.Select id="day-filter" name="availableDay" value={filters.availableDay} onChange={handleChange}>
                <option value="">Any day</option>
                {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
              </Form.Select>
            </div>
            <Button type="submit" variant="primary" className="directory-search-button"><MagnifyingGlass aria-hidden="true" />Search</Button>
            {hasFilters && <Button type="button" variant="link" className="filter-clear" onClick={clearFilters}>Clear all</Button>}
          </Form>
        </Container>
      </section>

      <Container className="directory-results">
        <aside className="directory-context" aria-label="Browse by specialty">
          <span><FunnelSimple aria-hidden="true" />Refine your search</span>
          <h2>Specialties</h2>
          <div className="specialty-filter-links">
            {specializations.map((item) => (
              <button key={item} type="button" className={filters.specialization === item ? 'active' : ''} onClick={() => selectSpecialization(item)}>{item}</button>
            ))}
          </div>
          <p>Not sure where to start? A general practitioner can assess common concerns and recommend next steps.</p>
        </aside>

        <div className="doctor-results-list">
          <div className="results-heading">
            <div><span className="section-index">Doctor directory</span><h2>{loading ? 'Searching…' : `${doctors.length} verified doctor${doctors.length === 1 ? '' : 's'}`}</h2></div>
            {hasFilters && <span className="active-filter-label"><FunnelSimple aria-hidden="true" />Filters applied</span>}
          </div>

          {loading ? (
            <div className="page-loading" role="status" aria-live="polite"><Spinner animation="border" /><span>Finding available doctors…</span></div>
          ) : error ? (
            <Alert variant="danger" className="d-flex justify-content-between align-items-center gap-3"><span>{error}</span><Button variant="outline-danger" size="sm" onClick={() => setRetryKey((value) => value + 1)}>Try again</Button></Alert>
          ) : doctors.length === 0 ? (
            <div className="empty-state directory-empty"><UserCircle aria-hidden="true" /><h2>No doctors match these filters</h2><p>Try another specialty, location, or working day.</p><Button variant="outline-primary" onClick={clearFilters}>Show all doctors</Button></div>
          ) : doctors.map((doctor) => {
            const nextSchedule = doctor.availability?.[0];
            return (
              <article className="doctor-result-row" key={doctor._id}>
                <img src={getDoctorImage(doctor)} alt={`Dr. ${doctor.name}`} width="112" height="112" loading="lazy" />
                <div className="doctor-result-identity">
                  <span>{doctor.specialization}</span>
                  <h3>Dr. {doctor.name}</h3>
                  <p>{doctor.qualification || `${doctor.experience} years of clinical experience`}</p>
                  <small><MapPin aria-hidden="true" />{doctor.location || 'Location shared on request'}</small>
                </div>
                <div className="doctor-result-fact"><small>Experience</small><strong><Stethoscope aria-hidden="true" />{doctor.experience} years</strong></div>
                <div className="doctor-result-fact"><small>Next published hours</small><strong><CalendarBlank aria-hidden="true" />{nextSchedule ? `${nextSchedule.day}, ${nextSchedule.startTime}` : 'Schedule pending'}</strong></div>
                <div className="doctor-result-action">
                  <small>Consultation fee</small><strong>Rp {doctor.consultationFee?.toLocaleString('id-ID')}</strong>
                  <Button as={Link} to={`/doctors/${doctor._id}`} variant="primary">View profile <span className="button-orb"><ArrowRight /></span></Button>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default DoctorListPage;

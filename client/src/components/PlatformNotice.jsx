import { useEffect, useState } from 'react';
import { Alert, Container } from 'react-bootstrap';
import api from '../services/api';

const PlatformNotice = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    api.get('/settings/public').then(({ data }) => setVisible(Boolean(data.data.maintenanceMode))).catch(() => {});
  }, []);
  if (!visible) return null;
  return <div className="maintenance-notice"><Container><Alert variant="warning" className="mb-0 rounded-0 border-0" role="status">DOCVIA is undergoing maintenance. Some appointment actions may be temporarily delayed.</Alert></Container></div>;
};

export default PlatformNotice;

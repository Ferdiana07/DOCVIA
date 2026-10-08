import api from './api';

const downloadDocument = async (appointmentId, filename = 'medical-document') => {
  const response = await api.get(`/appointments/${appointmentId}/document`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default downloadDocument;

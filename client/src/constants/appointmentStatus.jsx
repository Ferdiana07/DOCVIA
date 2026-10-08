import { CheckCircle as FaCheckCircle, Clock as FaClock, XCircle as FaTimesCircle } from '@phosphor-icons/react';

const appointmentStatus = {
  pending: { color: 'warning', icon: <FaClock aria-hidden="true" />, label: 'Pending' },
  approved: { color: 'success', icon: <FaCheckCircle aria-hidden="true" />, label: 'Confirmed' },
  rejected: { color: 'danger', icon: <FaTimesCircle aria-hidden="true" />, label: 'Declined' },
  cancelled: { color: 'secondary', icon: <FaTimesCircle aria-hidden="true" />, label: 'Cancelled' },
  completed: { color: 'info', icon: <FaCheckCircle aria-hidden="true" />, label: 'Completed' },
};

export default appointmentStatus;

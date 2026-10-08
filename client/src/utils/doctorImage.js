const LOCAL_DOCTOR_IMAGES = {
  'Sarah Jenkins': '/images/doctors/sarah-jenkins.webp',
  'Budi Santoso': '/images/doctors/budi-santoso.webp',
  'Emily Chen': '/images/doctors/emily-chen.webp',
  'Ahmad Ridwan': '/images/doctors/ahmad-ridwan.webp',
  'Linda Wijaya': '/images/doctors/linda-wijaya.webp',
};

export const getDoctorImage = (doctor) => (
  doctor?.profilePicture || LOCAL_DOCTOR_IMAGES[doctor?.name] || '/doctor-avatar.jpg'
);


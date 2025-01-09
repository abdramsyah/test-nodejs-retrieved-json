module.exports = {
  ROLES: {
    HRD: 'hrd',
    KARYAWAN: 'karyawan',
    ADMIN: 'admin',
    USER: 'user',
    OPERATION: 'operation',
    SUPER_ADMIN: 'super_admin',
  },

  STATUS: {
    ACTIVE: 'ACTIVE',
    // WAITING: 'WAITING_CONFIRMATION',
    INACTIVE: 'INACTIVE',
  },

  GENDER: {
    LAKI: 'laki-laki',
    PEREMPUAN: 'perempuan',
  },

  PRODUCT_STATUS: {
    WAITING_CONFIRMED: 'WAITING_CONFIRMED',
    ACTIVE: 'ACTIVE',
    CANCELLED: 'CANCELLED',
    UNSUBSCRIBE: 'UNSUBSCRIBE',
    ACCEPTED: 'ACCEPTED',
  },

  ORDER_STATUS: {
    WAITING_CONFIRMED: 'WAITING_CONFIRMED',
    CONFIRMED: 'CONFIRMED', //Belanjaan Sudah Terkonfirmasi',
    READY_FOR_PICKUP: 'READY_FOR_PICKUP', //Belanjaan Siap Diambil',
    RECEIVED: 'RECEIVED', //Belanjaan Sudah Diterima',
    NOT_PICKED_UP: 'NOT_PICKED_UP', //Belanjaan Kamu Belum Diambil',
    PICKED_UP: 'PICKED_UP', //Belanjaan Sudah Diambil',
    CANCELLED: 'CANCELLED', //Belanjaan Dibatalkan',
  },

  PAYMENT: {
    CASH: 'CASH',
    LINK: 'LINK',
  },

  ALLOWED_IMAGE: ['png', 'jpg', 'jpeg'],

  AVATAR: {
    DEFAULT: 'https://i.pravatar.cc/150?img=62',
  },

  LIMIT_VALUE: {
    AKTIF: 'AKTIF',
    KONFIRMASI: 'KONFIRMASI',
    TIDAK_AKTIF: 'TIDAK-AKTIF',
    DITOLAK: 'DITOLAK',
  },

  FORMAT_DISCOUNT: {
    PERCENTAGE: 'PERCENTAGE',
    NOMINAL: 'NOMINAL',
  },

  MESSAGE: {
    EMAIL_NOT_FOUND: 'Email Tidak ditemukan.',
    PASSWORD_SALAH: 'Password Salah',
    VERIFICATION_NOT_COMPLETED_MESSAGE:
      'Anda belum terverifikasi, silakan verifikasi terlebih dahulu.',
  },
};

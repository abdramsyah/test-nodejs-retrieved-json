'use strict';

    const faq = [
      {
        id: 1,
        pertanyaan: 'Apa itu aplikasi Grosri',
        jawaban:
          'Aplikasi Grosri adalaha aplikasi yang membantu kamu untuk bebelanja kebutuhan sehari - hari. dimana kamu sebagai pengguna aplikasi Grosri yang perusahaan kamu sudah bekerjasama dengan Grosri, dapat menikmati fasilitas XenmoValue .',
      },
      {
        id: 2,
        pertanyaan: 'Apa itu fitur berlangganan',
        jawaban: `Stok kebutuhan rumah aman, dengan fitur berlanggan
                  Khusus untuk anda Grosri memberikan fasiltas belanja secara langganan, kamu cukup pilih produk yang ingin dikirim kan ke rumah kamu, pilih waktu pengiriman yang terjadwal dan kamu bisa sewaktu - waktu berhenti berlanggan.

                  Cara berlanggan:
                  Pilih produk yang ingin kamu belanja secara berlangganan
                  Pilih rentang waktu pengiriman
                  Pilih sekema berlangganan
                  Pilih metode pembayaran.
                  `,
      },
      {
        id: 3,
        pertanyaan: 'Bagaimana cara saya berhenti belanja secara berlangganan.',
        jawaban: `kamu bisa berhenti belanja berlanggan kapan saja,  jika kamu berhenti berlanggan sebelum barang dikirim, maka grosri tidak akan mengirim produk tersebut ke kamu, jika kamu berhenti dalam periode 7 hari sebelum barang dikirim, maka fitur berhenti berlanggan baru bisa berlaku untuk langganan selanjutnya.`,
      },
      {
        id: 4,
        pertanyaan: 'Apa itu Xenmo Value : ',
        jawaban:
          'Xenmo Value adalaha fitur yang membantu kamu bisa bebelanja mulai tanggal 10 sd 23 disetiap bulanya, tanpa kamu harus membayar langsung, kamu akan membayar transaksi belanja kamu langsung dengan cara memotong gaji bulanan kamu, langsung melalui HR tempat kamu bekerja.',
      },
      {
        id: 5,
        pertanyaan: 'Dapatkah saya berbelanja terus menerus dengan menggunakan Xenmo Value',
        jawaban: 'Selama limit kamu masih tersedia, kamu masih bisa berbelanja di Grosri.',
      },
      {
        id: 6,
        pertanyaan: 'Pengiriman Produk',
        jawaban: 'Grosri menyediakan',
      },
      {
        id: 7,
        pertanyaan: 'Apakah Grosri memiliki kebijakan pengembalian barang?',
        jawaban: `1. Barang yang dikembalikan masih dalam masa periode pengembalian barang yaitu 2 hari sejak barang diterima.
                  2. Konsumen dapat melakukan penukaran atau pengembalian barang dengan kondisi barang sebagai berikut:
                  - Barang yang diterima tidak sesuai dengan pesanan;
                  - Barang yang diterima melebihi atau kurang dari kuantiti yang seharusnya didapatkan;
                  - Adanya kerusakan atau keadaan yang tidak sesuai pada pesanan, termasuk:
                  - Barang pecah atau rusak saat diterima;
                  - Isi volume barang tidak sesuai dengan pesanan
                  - Barang yang diretur harus:
                  - Belum pernah digunakan;
                  - Masih dalam kondisi sama saat pengiriman (lengkap dengan kotak kemasan, label dan lainnya);
                  3. Grosri  tidak menerima penukaran barang dengan alasan yang merupakan kelalaian pembeli, seperti jenis produk atau warna yang tidak sesuai dengan keinginan.
                  4. Grosri  berhak menolak pengajuan pengembalian barang jika:
                  - Pengembalian dilakukan tanpa alasan jelas
                  - Tanpa ada bukti video pada saat barang dikeluarkan dari packaging
                  - Kerusakan barang akibat kesalahan pemakaian, terjatuh, tergores, ternoda, pecah, terkena cairan, kecelakaan, kesalahan instalasi, pemeliharaan atau perbaikan yang tidak terotorisasi, mengubah atau merusak stiker garansi, nomor seri, dan tanda keaslian dan kerusakan yang diakibatkan selain manusia.
`,
      },
      {
        id: 8,
        pertanyaan: 'Dapatkah saya menentukan kurir yang digunakan untuk pengiriman barang?',
        jawaban: `saat ini, kamu bisa mengambil produk yang kamu beli langsung di toko offline kami di grosri mart yang beralamat di Jl. Niaga Raya No.C17, Pasirsari, Cikarang, Kabupaten Bekasi, Jawa Barat 17530, namun jika kamu request untuk barang dikirim, customer service kami akan menjadwalkan pengiriman dengan menggunakan pengiriman dari grab sent/ gosent atau kurir lainya, dan kaka akan dikenakan biaya pengiriman.`,
      },
    ];

    faq.forEach((e) => {
      e.createdAt = new Date();
      e.updatedAt = new Date();
    });

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Faq', faq, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Faq', null, {});
  },
};

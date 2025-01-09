const { Promo } = require('../../../models');
const { outputParser } = require('../../../utils/outputParser');
class PromoController {
  static async getPromo(req, res, next) {
    console.log('[LOG]: Promo');
    try {
      let decode = req.payload;

      const promos = await Promo.findAll({
        where: {
          userId: decode.id,
        },
        order: [['createdAt', 'DESC']], // Urutkan berdasarkan tanggal pembuatan, yang terbaru di atas
        limit: 10, // Batasi hanya mengambil 10 notifikasi terbaru
      });

      if (promos.length === 0) {
        return outputParser.error(req, res, 'Kosong belum ada Notification');
      }

      // Mengubah status isRead menjadi true
      const promoIds = promos.map((notification) => notification.id);
      await Promo.update({ isRead: true }, { where: { id: promoIds } });

      return outputParser.success(req, res, 'Berhasil Mendapatkan Notification', { promos });
    } catch (err) {
      return next(err);
    }
  }

  static async detailPromo(req, res, next) {
    console.log('[LOG]: Detail Promo', req.params);
    const { id } = req.params;

    try {
      const notification = await Promo.findOne({
        where: {
          id,
          userId: req.payload.id,
        },
      });

      if (!notification) {
        return outputParser.error(req, res, 'Notifikasi tidak ditemukan');
      }

      // Update the field name from `isRead` to `status`
      notification.isRead = true;
      await notification.save();

      return outputParser.success(req, res, 'Berhasil Mendapatkan Detail Notifikasi', { notification });
    } catch (err) {
      return next(err);
    }
  }

  static async createPromo(req, res, next) {
    console.log('[LOG]: Create Notification', req.params);

    // const { message, userId, isRead } = req.body;

    // try {
    //   const notification = await Notification.create({
    //     message,
    //     userId,
    //     isRead
    //   });

    const dummyData = [
      {
        title: 'Berkah Lebaran 2023!!',
        message: 'Dummy Notification 1',
        banner: '',
        userId: 2,
        isRead: false,
      },
      {
        title: 'Berkah Lebaran 2023!!',
        message: 'Dummy Notification 2',
        banner: '',
        userId: 2,
        isRead: false,
      },
      {
        title: 'Berkah Lebaran 2023!!',
        message: 'Dummy Notification 3',
        banner: '',
        userId: 2,
        isRead: false,
      },
    ];

    try {
      const notifications = await Promo.bulkCreate(dummyData);

      return outputParser.success(req, res, 'Berhasil Membuat Notifikasi', { notifications });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = {
  PromoController,
};

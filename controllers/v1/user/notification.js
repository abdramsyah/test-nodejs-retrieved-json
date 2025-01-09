const { cekToken } = require('../../../helpers/generalHelpers');
const { Users, Notification, Promo, Events, Products } = require('../../../models');
const { outputParser } = require('../../../utils/outputParser');
class NotificationController {
  static async getNotificationGeneral(req, res, next) {
    console.log('[LOG]: Notification General');
    try {
      const token = req.header('authorization').split(' ')[1];
      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }
      let decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET); //Verify Token

      const notifications = await Notification.findAll({
        where: {
          userId: decode.id,
        },
        order: [['createdAt', 'DESC']], // Urutkan berdasarkan tanggal pembuatan, yang terbaru di atas
        limit: 10, // Batasi hanya mengambil 10 notifikasi terbaru
      });

      if (notifications.length === 0) {
        return outputParser.successCustom(req, res, 'Kosong belum ada Notification');
      }

      // Mengubah status isRead menjadi true
      const notificationIds = notifications.map((notification) => notification.id);
      await Notification.update({ isRead: true }, { where: { id: notificationIds } });

      return outputParser.success(req, res, 'Berhasil Mendapatkan Notification', { notifications });
    } catch (err) {
      return next(err);
    }
  }

  static async getNotificationPromo(req, res, next) {
    console.log('[LOG]: Notification Promo');
    try {
      let decode = req.payload; //Verify Token

      const notifications = await Promo.findAll({
        where: {
          userId: decode.id,
        },
        order: [['createdAt', 'DESC']], // Urutkan berdasarkan tanggal pembuatan, yang terbaru di atas
        limit: 10, // Batasi hanya mengambil 10 notifikasi terbaru
        attributes: ['id', 'title', 'message', 'banner', 'isRead', 'event_id', 'createdAt'],
        raw: true,
        nest: true,
      });

      if (notifications.length === 0) {
        return outputParser.success(req, res, 'Kosong belum ada Notification');
      }
      const eventIds = notifications.map((notification) => notification.event_id);

      const events = await Events.findAll({
        where: {
          id: eventIds,
        },
        attributes: ['id', 'event_name', 'slug'],
        raw: true,
        nest: true,
      });

      const mappedNotifications = notifications.map((notification) => {
        const matchingEvent = events.find((event) => event.id === notification.event_id);
        if (matchingEvent) {
          return {
            ...notification,
            title: matchingEvent.event_name,
            slug: matchingEvent.slug,
          };
        } else {
          return notification;
        }
      });

      return outputParser.success(req, res, 'Berhasil Mendapatkan Promo', {
        notifications: mappedNotifications,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async detailNotification(req, res, next) {
    console.log('[LOG]: Detail Promo', req.params);
    const { id: notificationId } = req.body;

    try {
      const notification = await Promo.findOne({
        where: {
          userId: notificationId,
        },
      });

      if (!notification) {
        return outputParser.error(req, res, 'Notifikasi tidak ditemukan');
      }

      return outputParser.success(req, res, 'Berhasil Mendapatkan Detail Notifikasi', { notification });
    } catch (err) {
      return next(err);
    }
  }

  static async createNotification(req, res, next) {
    console.log('[LOG]: Create Notification', req.params);

    try {
      const users = await Users.findAll(); // Mengambil semua pengguna dari tabel Users

      const notifications = users.map((user) => {
        console.log(user.id);
        console.log('[LOG]: Create Notification', user.id);
        return {
          title: 'Belanjaan Siap Diambil!',
          message: 'Dummy Notification',
          userId: user.id,
          isRead: false,
        };
      });

      const createdNotifications = await Notification.bulkCreate(notifications);

      return outputParser.success(req, res, 'Berhasil Membuat Notifikasi', {
        notifications: createdNotifications,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async getDetailPromoEvent(req, res) {
    try {
      console.log('[LOG]: get Detail Promo Event', req.params);

      const decode = req.payload;

      // if (!notification) {
      //   return outputParser.error(req, res, 'Notifikasi tidak ditemukan');
      // }

      // Mendapatkan query parameter "id" dari permintaan
      const slug = req.params.slug;
      // const slug = req.query.slug
      const events = await Events.findAll({
        include: {
          model: Products,
          // as: 'products',
          limit: 5,
        },
        // Menambahkan kondisi WHERE berdasarkan ID
        where: {
          // id: eventId
          slug: slug,
        },
        attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });
      console.log('events   >>> ', events);

      const notification = await Promo.findOne({
        where: {
          userId: decode.id,
          event_id: events[0].id,
          isRead: false,
        },
        raw: true,
        nest: true,
      });

      if (notification != null) {
        await Promo.update({ isRead: true }, {
          where: {
            id: notification.id, // Assuming 'id' is the primary key of the Promo table
          }
        });
      }


      console.log({ notification });

      // Memodifikasi event dan produk dengan menghitung harga diskon
      const event = events.map((event) => {
        const modifiedProducts = event.Products.map((product) => {
          if (product.discount !== null) {
            const price = (product.base_price * (100 - product.discount)) / 100;
            return { ...product.toJSON(), price };
          } else {
            return product;
          }
        });
        return { ...event.toJSON(), Products: modifiedProducts };
      });

      // return outputParser.success(req, res, 'Get Event Success', {
      //   event
      // });
      let tmp = event[0];
      return res.status(200).send({
        success: true,
        message_client: 'Get Event Success asdasds',
        data: tmp,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = {
  NotificationController,
};

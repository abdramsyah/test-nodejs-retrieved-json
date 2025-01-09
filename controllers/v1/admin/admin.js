const { STATUS, ROLES } = require('../../../config/constant');
const Paginator = require('../../../helpers/paginator');
const { validationResult } = require('express-validator');
const Op = require('sequelize').Op;
const { generateToken } = require('../../../helpers/generalHelpers');
const { Notification, Users, Orders, OrderHistories, ResetPassword } = require('../../../models');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');
const { sendLinkResetPasswordAdmin } = require('../../../service/sendKodeOtp');

class AdminController {
  static async updateSubscribe(req, res) {
    Log.info('[LOG ADMIN]: Update Status Order', { data: req.body });
    let user_id = null;
    try {
      const { status, order_number, date_pickup } = req.body;
      // const decode = req.payload;

      const order = await Orders.findOne({
        where: {
          order_number,
        },
      });
      user_id = order.user_id;

      if (!order) {
        return outputParser.error(req, res, 'order not found', 404);
      }

      // Perbarui status order menjadi "CONFIRMED"
      await order.update({
        status,
      });

      // Buat entri baru di OrderHistories
      await OrderHistories.create({
        order_id: order.id,
        status,
        user_id,
        date_pickup,
      });

      let title = '';
      let message = '';
      let pesanan = '';

      switch (status) {
        case 'WAITING_CONFIRMED':
          title = 'Terima kasih sudah berbelanja di Grosri!';
          message = `Link pembayaran akan dikirim oleh WhatsApp (0812-1348-2881) setelah pesanan divalidasi.`; // 1610125205990002  Mifta12,
          break;
        case 'CONFIRMED':
          title = 'Belanjaan Sudah Terkonfirmasi';
          pesanan = 'Pesanan Terkonfirmasi';
          message = `Pesanan ${order.order_number} akan segera disiapkan untukmu.`;
          break;
        case 'READY_TO_PICKUP':
          title = 'Belanjaan Siap Diambil';
          pesanan = 'Pesanan Siap Diambil';
          message = `Pesanan ${order.order_number} sudah siap diambil. Silahkan cek disini`;
          break;
        case 'FINISH':
          title = 'Belanjaan Sudah Diterima!';
          pesanan = 'Pesanan Selesai';
          message = `Ke puncak metik stroberi. Terima kasih sudah belanja di Grosri`;
          break;
        case 'CANCELLED':
          title = 'Belanjaan Dibatalkan';
          pesanan = 'Pesanan Dibatalkan';
          message = `Pesanan ${order.order_number} sudah dibatalkan.`;
          break;
        default:
          // Handle other status here if needed
          break;
      }

      await Notification.create({
        title,
        message,
        order_number: order.order_number,
        userId: user_id,
        isRead: false,
      });

      return outputParser.success(req, res, 'Success Update Status Order', pesanan);
    } catch (err) {
      console.log({ err });
      return outputParser.error(req, res, 'Gagal Update status Order');
    }
  }

  static async createNewAdmin(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        Log.error(errors);
        return outputParser.errorValidatorFirst(req, res, errors);
      }

      const { email, full_name, role } = req.body;

      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        let data = {
          data: 'tambah user gagal',
        };
        return outputParser.errorCustom(req, res, 'Email sudah terdaftar', data);
      }

      const data = {
        email,
        password: 'deF4uLtP4sswd',
        full_name,
        role,
        status: STATUS.ACTIVE,
      };

      await Users.create(data);

      const payload = { email };
      const token = generateToken(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        process.env.JWT_ACCESS_RESET_TOKEN_EXPIRE
      );

      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await ResetPassword.create({
        email,
        token,
        expires_at,
      });

      const sendEmail = await sendLinkResetPasswordAdmin(email, full_name, token);

      if (sendEmail.error) {
        return outputParser.errorCustom(req, res, sendEmail.message, null);
      }

      return outputParser.success(req, res, 'Create User Management Success');
    } catch (err) {
      Log.error(err);
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  static async getListAdmin(req, res) {
    let queryResult = null;
    let { page, size: limit, search, sort, direction = 'ASC' } = req.query;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    try {
      let where = { role: [ROLES.OPERATION, ROLES.SUPER_ADMIN] };
      let order = [];
      if (search) {
        // Object.assign(where, {
        //   full_name: { [Op.iLike]: `%${search}%` },
        // });
        Object.assign(where, {
          [Op.or]: [
            {
              full_name: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              email: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        });
      }

      if (sort && direction) {
        order.push([sort, direction]);
      } else {
        order.push(['full_name', 'ASC']);
      }

      queryResult = await Users.findAndCountAll({
        attributes: ['id', 'full_name', 'email', 'role', 'status'],
        where,
        limit,
        offset,
        order,
      });

      let template = {
        count: queryResult.count,
        rows: queryResult.rows.map((user_managament) => ({
          id: user_managament.id,
          full_name: user_managament.full_name,
          email: user_managament.email,
          role: user_managament.role == 'super_admin' ? 'Super Admin' : 'Operations',
          status: user_managament.status,
        })),
      };

      // Super Admin
      // Operation

      paging.setData(template);
      const resp = paging.getPaginator();
      return outputParser.success(req, res, 'List User Managament Success', resp);
    } catch (err) {
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async getAdminById(req, res) {
    let errs = validationResult(req);
    if (!errs.isEmpty()) {
      Log.error(errs);
      return outputParser.errorValidatorFirst(req, res, errs);
    }
    const { id } = req.params;
    try {
      const admin = await Users.findOne({
        attributes: ['id', 'full_name', 'email', 'role', 'status'],
        where: { id },
      });
      if (!admin) {
        return outputParser.notFound(req, res, 'Cannot find data');
      }
      let template = {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role == 'super_admin' ? 'Super Admin' : 'Operations',
        status: admin.status,
      };

      return outputParser.success(req, res, 'Get admin success', template);
    } catch (err) {
      Log.error(err.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateAdmin(req, res) {
    Log.info('[LOG]: Update Admin');
    const { email, full_name, role, password, status } = req.body;
    const adminId = req.params.id; // Ambil ID admin dari parameter permintaan

    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        Log.error(errors);
        return outputParser.errorValidatorFirst(req, res, errors);
      }
      // Cek apakah admin dengan ID yang diberikan ada
      const admin = await Users.findByPk(adminId);

      if (!admin) {
        return outputParser.errorCustom(req, res, 'Admin tidak ditemukan', null, 404);
      }

      // Periksa apakah ada admin lain dengan alamat email yang sama
      const adminWithSameEmail = await Users.findOne({
        where: { email, id: { [Op.not]: adminId } }, // Memeriksa email yang sama selain admin yang sedang diperbarui
      });

      if (adminWithSameEmail) {
        return outputParser.errorCustom(
          req,
          res,
          'Alamat email sudah digunakan oleh admin lain',
          null,
          400
        );
      }

      // Perbarui data admin
      await admin.update({
        email,
        password,
        full_name,
        role,
        status,
      });

      return outputParser.success(req, res, 'Sukses memperbarui Admin');
    } catch (err) {
      Log.error('update admin', err);
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  static async deleteAdmin(req, res) {
    Log.info('[LOG]: Delete Admin');
    const adminId = req.params.id; // Ambil ID admin dari parameter permintaan

    try {
      // Cek apakah admin dengan ID yang diberikan ada
      const admin = await Users.findByPk(adminId);

      if (!admin) {
        return outputParser.errorCustom(req, res, 'Admin tidak ditemukan', null, 404);
      }

      // Hapus admin
      // await admin.destroy();
      await admin.update({ status: 'INACTIVED' });

      return outputParser.success(req, res, 'Sukses menghapus Admin');
    } catch (err) {
      Log.error('delete admin', err);
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }
}

module.exports = {
  AdminController,
};

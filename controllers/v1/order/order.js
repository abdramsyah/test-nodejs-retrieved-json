const constant = require('../../../config/constant');
const { cekToken } = require('../../../helpers/generalHelpers');
const {
  Products,
  Cart,
  LimitValue,
  Orders,
  OrderProducts,
  OrderHistories,
  Notification,
} = require('../../../models');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');
const moment = require('moment');
const { parse, format } = require('date-fns');

function hitungTotalHarga(orderProducts) {
  let sub_total = 0;
  let discount = 0;
  let total = 0;

  for (const product of orderProducts) {
    const basePrice = product.base_price;
    const quantity = product.quantity;
    const productDiscount = product.discount_price || 0;

    sub_total += basePrice * quantity;
    discount += productDiscount * quantity;
    total += (basePrice - productDiscount) * quantity;
  }

  return { sub_total, discount, total };
}
class OrderController {
  static async addToCart(req, res, next) {
    try {
      console.log('[LOG]: add to cart', req.body);

      const { product_id, quantity } = req.body;

      const products = await Products.findOne({
        where: {
          id: product_id,
        },
        raw: true,
        nest: true,
      });

      if (products.stock < 1) {
        return outputParser.error(
          req,
          res,
          'Tidak dapat melakukan add produk ke keranjang karena stok sudah habis'
        );
      }

      const existingCartItem = await Cart.findOne({
        where: {
          product_id: product_id,
          user_id: req.payload.id,
          status: false,
        },
      });

      if (existingCartItem) {
        // Jika product_id sudah ada di keranjang, tambahkan kuantitas
        existingCartItem.quantity += quantity;
        await existingCartItem.save();
        return outputParser.create(req, res, 'Berhasil menambahkan ke Keranjang');
      } else {
        // Jika product_id belum ada di keranjang, buat entri baru
        const userCartItems = await Cart.findAll({
          where: { user_id: req.payload.id },
        });

        userCartItems.length;

        // if (cartItemsCount >= MAX_CART_ITEMS) {
        //   // Batasi jumlah item di keranjang
        //   return outputParser.error(
        //     req,
        //     res,
        //     `Jumlah maksimum item di keranjang adalah ${MAX_CART_ITEMS}`
        //   );
        // }

        const data = {
          product_id,
          quantity,
          email: req.payload.email,
          user_id: req.payload.id,
        };

        await Cart.create(data);
        return outputParser.create(req, res, 'Berhasil menambahkan ke Keranjang');
      }
    } catch (error) {
      return next(error);
    }
  }

  static async getCart(req, res, next) {
    try {
      Log.info('[LOG]: get Cart', req.body);

      let decode = req.payload;

      const carts = await Cart.findAll({
        where: {
          user_id: decode.id,
          status: false,
        },
      });

      const productIds = carts.map((cart) => cart.product_id);

      const products = await Products.findAll({
        where: {
          id: productIds,
        },
      });

      let total = 0;
      let totalDiscount = 0;

      const cartProducts = products
        .map((product) => {
          const cartItem = carts.find((cart) => cart.product_id === product.id);

          const itemTotal = product.base_price * cartItem.quantity;
          total += itemTotal;

          const itemDiscount = product.discount ? product.discount_price : 0;
          totalDiscount += itemDiscount;

          return {
            id: product.id,
            name: product.product_name,
            base_price: product.base_price,
            base_price_discount: product.base_price_discount,
            stock: product.stock,
            image: product.image,
            quantity: cartItem.quantity,
            price: product.discount ? product.base_price : product.base_price_discount,
            discount: product.discount,
            discount_price: product.discount_price,
            discount_percentage: product.discount_percentage,
            total: itemTotal,
            description_product: product.description_product,
          };
        })
        .filter((product) => product.quantity > 0);

      const subscribe = [
        {
          tipe: 'Bulanan',
          detail: 'Pengambilan setiap bulan selama jam operasional',
        },
        {
          tipe: 'Mingguan',
          detail: 'Pengambilan setiap minggu selama jam operasional',
        },
      ];

      const saldo = await LimitValue.findOne({ where: { user_id: decode.id } });
      let saldo_grosri = saldo ? saldo.saldo_limit : 0;

      return outputParser.success(req, res, 'Get Cart Success', {
        products: cartProducts,
        subtotal: total,
        totalDiscount,
        subscribe,
        saldo_grosri,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteCart(req, res, next) {
    try {
      console.log('[LOG]: add to Delete Cart', req.body);

      const token = req.header('authorization').split(' ')[1];
      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }

      let decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET); //Verify Token

      const { product_id, quantity } = req.body;

      const existingCartItem = await Cart.findOne({
        where: { product_id: product_id, user_id: decode.id },
      });

      // Jika product_id sudah ada di keranjang, kurangi kuantitas
      if (existingCartItem.quantity >= quantity) {
        existingCartItem.quantity -= quantity;
        if (existingCartItem.quantity <= 0) {
          // Hapus item dari keranjang
          await existingCartItem.destroy();
          return outputParser.create(req, res, 'Berhasil menghapus dari Keranjang');
        } else {
          // Simpan perubahan kuantitas
          await existingCartItem.save();
          return outputParser.create(req, res, 'Berhasil mengurangi dari Keranjang');
        }
      } else {
        // Jika product_id tidak ada di keranjang
        return outputParser.create(req, res, 'Product tidak ditemukan di Keranjang');
      }
    } catch (error) {
      return next(error);
    }
  }

  static async subscribe(req, res, next) {
    try {
      console.log('[LOG]: get Cart', req.body);

      const token = req.header('authorization').split(' ')[1];
      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }

      let decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET); //Verify Token

      const carts = await Cart.findAll({
        where: {
          user_id: decode.id,
        },
      });

      const productIds = carts.map((cart) => cart.product_id);

      const products = await Products.findAll({
        where: {
          id: productIds,
        },
      });

      let total = 0;
      let totalDiscount = 0;

      const cartProducts = products.map((product) => {
        const cartItem = carts.find((cart) => cart.product_id === product.id);

        const itemTotal = product.price * cartItem.quantity;
        total += itemTotal;

        const itemDiscount = (product.price * cartItem.quantity * product.discount) / 100;
        totalDiscount += itemDiscount;

        return {
          id: product.id,
          name: product.product_name,
          price: product.price,
          quantity: cartItem.quantity,
          total: itemTotal,
        };
      });

      const subscribe = [
        {
          tipe: 'Bulanan',
          detail: 'Pengambilan setiap bulan selama jam operasional',
        },
        {
          tipe: 'Mingguan',
          detail: 'Pengambilan setiap minggu selama jam operasional',
        },
      ];

      const datetopick = null;

      return outputParser.success(req, res, 'Get Cart Success', {
        products: cartProducts,
        subtotal: total,
        totalDiscount,
        subscribe,
        datetopick,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async preOrder(req, res, next) {
    try {
      // Mendapatkan waktu saat ini
      const currentMoment = moment();

      // Menambahkan 7 jam ke waktu saat ini (zona waktu Jakarta)
      const currentMomentInJakarta = currentMoment.add(0, 'hours');

      const currentHour = currentMomentInJakarta.hours();
      const currentDate = currentMomentInJakarta;
      Log.info({ preOrder: currentHour });
      const validOrderDates = [];
      // Tambahkan hari ini jika belum jam 5 dan bukan Sabtu/Minggu
      if (currentHour < 17 && currentDate.day() !== 6 && currentDate.day() !== 0) {
        validOrderDates.push(currentDate.clone());
      }

      for (let i = 0; i < 3; i++) {
        // Hitung D+1, D+2, dan D+3 berdasarkan tanggal saat ini
        currentDate.add(1, 'days');

        // Periksa apakah tanggal yang dihitung adalah hari akhir pekan (Sabtu atau Minggu)
        while (currentDate.day() === 0 || currentDate.day() === 6) {
          // Jika itu hari akhir pekan, tambahkan 1 hari untuk membuatnya menjadi hari Senin
          currentDate.add(1, 'days');
        }

        validOrderDates.push(currentDate.clone());
      }

      return outputParser.success(req, res, 'Tanggal PreOrder', {
        validOrderDates: validOrderDates.map((date) => date.format('YYYY-MM-DD')),
        // validOrderDates: validOrderDates.map((date) => date.format('YYYY-MM-DD HH:mm:ss')),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Kesalahan Server Internal' });
    }
  }

  static async createOrder(req, res, next) {
    try {
      const { products, payment, date, notes } = req.body;

      const decode = req.payload;
      const user_id = decode.id;

      // Daftar nama bulan
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      // Membagi string tanggal menjadi bagian-bagian
      const dateParts = date.split(' ');
      const day = parseInt(dateParts[0], 10);
      const monthName = dateParts[1];
      const year = parseInt(dateParts[2], 10);
      const month = monthNames.indexOf(monthName);

      // Buat objek Date berdasarkan tanggal yang ditemukan
      const orderDateTime = new Date(year, month, day);
      const orderDate = orderDateTime.getDate();

      const currentDate = new Date();
      const DateNow = currentDate.getDate();
      const currentHour = currentDate.getHours();

      if (orderDate == DateNow && currentHour >= 17) {
        const validOrderDates = [];
        for (let i = 1; i <= 3; i++) {
          const nextDate = new Date(currentDate);
          nextDate.setDate(currentDate.getDate() + i);

          if (nextDate.getDay() === 6) {
            nextDate.setDate(nextDate.getDate() + 2);
          } else if (nextDate.getDay() === 0) {
            nextDate.setDate(nextDate.getDate() + 1);
          }

          validOrderDates.push(nextDate);
        }

        // return res.status(400).json({ message: 'Silahkan ganti tanggal yang sesuai ya', validOrderDates });
        return outputParser.badRequest(
          req,
          res,
          'Permintaan kamu sudah melewati jam minimum pemesanan, silahkan ganti tanggal pengambilan',
          validOrderDates
        );
      }

      // Mendapatkan tanggal saat ini dengan format 'DDMMYY'
      const current_date = new Date()
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
        .replace(/\//g, '');

      // Mendapatkan nilai terakhir dari subscribe_detail dalam database
      const last_order = await Orders.findOne({
        attributes: ['order_number'],
        order: [['id', 'DESC']],
      });
      // Mendapatkan kode invoice unik berdasarkan nilai terakhir dalam database
      const code_number = last_order
        ? String(Number(last_order.order_number.slice(-8)) + 1).padStart(8, '0')
        : '00000001';

      const productIds = products.map((product) => product.product_id);

      // Mendapatkan data produk berdasarkan productIds
      const dataproducts = await Products.findAll({
        attributes: [
          'id',
          'category_id',
          'product_name',
          'description',
          'base_price',
          'base_price_discount',
          'stock',
          'image',
          'discount',
          'event_id',
        ],
        where: { id: productIds },
      });

      let total_price = 0;
      let sub_total_price = 0;

      dataproducts.forEach((product) => {
        const purchasedQuantity = products.find((p) => p.product_id === product.id).qty;
        const total = product.discount
          ? product.base_price_discount * purchasedQuantity
          : product.base_price * purchasedQuantity;

        product.total = total;
        total_price += total;
        sub_total_price += product.base_price * purchasedQuantity;
      });
      // Mengurangi stok produk yang dibeli
      for (const product of dataproducts) {
        const purchasedQuantity = products.find((p) => p.product_id === product.id).qty;
        const remainingStock = product.stock - purchasedQuantity;

        if (remainingStock < 0) {
          // Jika stok tidak mencukupi, kirimkan response error
          return res.status(400).json({
            message: `Insufficient stock for product: ${product.name}`,
          });
        }

        // Update stok produk
        await product.update({ stock: remainingStock });
      }

      const order = {
        order_number: `${current_date}${code_number}`,
        status: constant.PRODUCT_STATUS.WAITING_CONFIRMED,
        total_product: productIds.length,
        total: total_price,
        sub_total: sub_total_price,
        user_id,
        payment: payment,
        date_pickup: date,
        noted: notes,
        images: dataproducts[0]?.image,
      };

      const created_order = await Orders.create(order);

      // Update status keranjang menjadi true
      await Cart.update({ status: true }, { where: { user_id, status: false } });
      const bulkCreateData = products.map((product) => ({
        order_id: created_order.id,
        product_id: product.product_id,
        quantity: product.qty,
        base_price: product.base_price,
        base_price_discount: product.base_price_discount,
        discount: product.discount,
        discount_price: product.discount_price,
      }));

      await OrderProducts.bulkCreate(bulkCreateData);
      await OrderHistories.create({
        order_id: created_order.id,
        status: constant.PRODUCT_STATUS.WAITING_CONFIRMED,
        user_id,
      });

      await Notification.create({
        title: 'Terima kasih sudah berbelanja di Grosri!',
        message: 'Silahkan cek pesan whatsapp oleh nomor +62 812-1348-2881',
        order_number: created_order.order_number,
        userId: decode.id,
        isRead: false,
        where: {
          userId: decode.id,
        },
      });

      return outputParser.success(req, res, 'Order Success', {
        subscribe: created_order,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getListOrder(req, res, next) {
    try {
      // console.log('[LOG]: Get List Order', req.body);

      const decode = req.payload;
      const user_id = decode.id;

      let orders = await Orders.findAll({
        where: {
          user_id,
        },
      });

      return outputParser.success(req, res, 'Get List Orders Success', {
        orders,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getDetailOrder(req, res, next) {
    try {
      console.log('[LOG]: Get Detail Order', req.body);

      const decode = req.payload;
      const user_id = decode.id;

      const { order_number } = req.params; // Mengambil order_number dari parameter
      let status_order = '';

      const orders = await Orders.findOne({
        where: {
          user_id,
          order_number, // Filter berdasarkan order_number
        },
        raw: true,
        nest: true,
      });

      if (orders.length === 0) {
        return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
      }

      switch (orders.status) {
        case 'WAITING_CONFIRMED':
          if (orders.payment === constant.PAYMENT.CASH) {
            status_order = `Pesanan diterima. Tunggu pesan konfirmasi melalui WhatsApp (0812-1348-2881).`;
          } else if (orders.payment === constant.PAYMENT.LINK) {
            status_order = `Link pembayaran akan dikirim oleh WhatsApp (0812-1348-2881) setelah pesanan divalidasi.`;
          }
          break;
        case 'CONFIRMED':
          status_order = `Pesanan terkonfirmasi. Silahkan ambil pesananmu sesuai tanggal pengambilan!`;
          break;
        case 'READY_TO_PICKUP':
          status_order = `Pesanan siap diambil! Silahkan datang ke gerai Grosri untuk mengambil pesananmu!`;
          break;
        case 'FINISH':
          status_order = `Yeay pesanan telah selesai! Terimakasih sudah berbelanja melalui Grosri.`;
          break;
        case 'CANCELLED':
          status_order = `Pesanan telah dibatalkan.`;
          orders.date_pickup = '-';
          break;
        default:
          status_order = 'Status pesanan tidak dikenali.';
      }

      const order_products = await OrderProducts.findAll({
        include: [
          {
            model: Products,
            as: 'product',
          },
        ],
        where: {
          order_id: orders.id,
        },
        raw: true,
        nest: true,
      });

      let datepickup = orders.date_pickup;
      const parsedDate = moment(datepickup, 'DD MMMM YYYY', 'id');
      const formattedDate = parsedDate.format('YYYY-MM-DD');

      const formattedResult = {
        status_order,
        orders_information: {
          status: orders.status,
          payment: orders.payment,
          order_number: orders.order_number,
          date_order: moment(orders.created_at).format('YYYY-MM-DD'),
          time_order: moment(orders.created_at).format('HH:mm:ss'),
          // date_pickup: orders.date_pickup,
          date_pickup: formattedDate,
          total_product: orders.total_product,
          total: orders.total,
          sub_total: orders.sub_total,
          user_id: orders.user_id,
          images: orders.image,
          updated_at: orders.updated_at,
        },
        noted: orders.noted,
        shopping_list: order_products.map((product) => ({
          product_name: product.product.product_name,
          quantity: product.quantity,
          discount_price: product.base_price - product.discount_price,
          discount: product.discount ? true : false,
          base_price: product.base_price,
          sub_total: product.discount ? product.base_price_discount : product.base_price,
        })),
        total_payment: hitungTotalHarga(order_products),
      };

      return outputParser.success(req, res, 'Get Detail Orders Success', formattedResult);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async cancelOrder(req, res, next) {
    try {
      console.log('[LOG]: Get Cancel Order', req.body);

      const decode = req.payload;
      const user_id = decode.id;
      let title = '';
      let message = '';

      const { order_number } = req.params; // Mengambil order_number dari parameter rute

      const order = await Orders.findOne({
        where: {
          user_id,
          order_number, // Filter berdasarkan order_number
        },
      });

      if (!order) {
        return outputParser.notFound(req, res, 'Pesanan tidak ditemukan');
      }

      await OrderHistories.create({
        order_id: order.id,
        status: constant.ORDER_STATUS.CANCELLED,
        user_id,
      });
      order.status = constant.ORDER_STATUS.CANCELLED;
      order.save();

      title = 'Belanjaan Dibatalkan';
      message = `Pesanan ${order.order_number} sudah dibatalkan. USER`;

      await Notification.create({
        title,
        message,
        order_number: order.order_number,
        userId: user_id,
        isRead: false,
      });

      return outputParser.success(req, res, 'Canceled Orders Success');
    } catch (err) {
      console.error(err);
      return outputParser.error(req, res, 'Canceled Order Fail', err);
    }
  }
}

module.exports = {
  OrderController,
};

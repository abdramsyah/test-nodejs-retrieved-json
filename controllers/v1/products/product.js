const { cekToken } = require('../../../helpers/generalHelpers');
const {
  Users,
  Products,
  Categories,
  Favorit,
  Subscribe,
  SubscribeHistory,
  suggest_products,
  Cart,
  Notification,
  sequelize,
  ProductType,
  LimitValue,
} = require('../../../models');
const Op = require('sequelize').Op;
const { QueryTypes } = require('sequelize');
const { outputParser } = require('../../../utils/outputParser');
const constant = require('../../../config/constant');
const moment = require('moment');

class ProductController {
  static async searchProduct(req, res) {
    try {
      console.log('[LOG]: SearchProduct', req.query);
      const keyword = req.query.q;
      const query = `
                  SELECT
                    "Products".id,
                    "Products".product_name,
                    "Products".base_price,
                    "Products".image,
                    "Products".stock,
                    "Products".discount,
                    "Products".discount_percentage,
                    "Products".base_price_discount AS price,
                    "Products".status
                  FROM
                    "Products"
                  LEFT JOIN
                    "Categories" ON "Products"."category_id" = "Categories"."id"
                  WHERE
                    (("Products"."product_name" ILIKE :keyword 
                    OR "Products"."description" ILIKE :keyword)
                    OR "Categories"."category_name" ILIKE :keyword)
                    AND "Products".status = 'ACTIVE';`;

      const replacements = { keyword: `%${keyword}%` };

      const products = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const categories = await Categories.findAll({
        include: {
          model: ProductType,
          attributes: ['id', 'name_type_product', 'images'],
        },
        attributes: ['id', 'category_name'], // Menambahkan 'id' sebagai atribut yang diambil dari Categories
      });

      // if (!products) {
      //   return outputParser.success(req, res, 'Pencarian Produk Berhasil', {
      //     products,
      //     categories,
      //   });
      // }

      return outputParser.success(req, res, 'Pencarian Produk Berhasil', { products, categories });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Kesalahan Server Internal' });
    }
  }

  static async detailProduct(req, res) {
    try {
      const { product_id } = req.query;

      const token = req.header('authorization') ? req.header('authorization').split(' ')[1] : null;
      let decode = null;
      let isFavorite = false;

      if (token) {
        decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        const favorite = await Favorit.findOne({
          where: {
            user_id: decode.id,
            product_id: product_id,
          },
        });

        isFavorite = !!favorite; // Mengonversi hasil query menjadi nilai boolean
      }

      const product = await Products.findOne({
        include: {
          model: Categories,
          attributes: ['id', 'category_name'],
        },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: {
          id: product_id,
        },
      });
      const price = product.base_price - (product.base_price * product.discount) / 100;

      if (!product) {
        return outputParser.error(req, res, 'Product not found');
      }

      // Menemukan produk yang serupa berdasarkan kategori yang sama
      const similarProducts = await Products.findAll({
        where: {
          id: { [Op.ne]: product.id }, // Memastikan tidak termasuk produk yang sedang dilihat
        },
        include: {
          model: Categories,
          attributes: ['id', 'category_name'],
          where: {
            id: product.Category.id, // Memastikan kategori sama
          },
        },
        limit: 5,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      let templateProduct = {
        id: product.id,
        category_id: product.category_id,
        product_name: product.product_name,
        description: product.description,
        base_price: product.base_price,
        base_price_discount: product.base_price_discount,
        stock: product.stock,
        image: product.image,
        discount: product.discount,
        is_event_product: product.is_event_product,
        event_id: product.event_id,
        status: product.status,
        discount_price: product.discount_price,
        discount_percentage: product.discount_percentage,
        prioritas: product.prioritas,
        category_name: product.Category.category_name,
        isFavorite: isFavorite,
        price: product.discount ? product.base_price_discount : product.base_price,
      };

      let product_name = similarProducts.map((similarProduct) => ({
        id: similarProduct.id,
        category_id: similarProduct.category_id,
        product_name: similarProduct.product_name,
        description: similarProduct.description,
        base_price: similarProduct.base_price,
        base_price_discount: similarProduct.base_price_discount,
        stock: similarProduct.stock,
        image: similarProduct.image,
        discount: similarProduct.discount,
        is_event_product: similarProduct.is_event_product,
        event_id: similarProduct.event_id,
        status: similarProduct.status,
        discount_price: similarProduct.discount_price,
        discount_percentage: product.discount_percentage,
        prioritas: similarProduct.prioritas,
        category_name: similarProduct.Category.category_name,
        isFavorite: isFavorite,
        price: similarProduct.discount
          ? similarProduct.base_price_discount
          : similarProduct.base_price,
      }));
      // product_name: similarProducts.product_name,

      return outputParser.success(req, res, 'Get Detail Product Success', {
        product: templateProduct,
        similar_product: product_name,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async createFavorit(req, res, next) {
    try {
      console.log('[LOG]: add favorit', req.body);
      const decode = req.payload;
      const { product_id } = req.body;
      await Favorit.create({ user_id: decode.id, product_id });
      return outputParser.create(req, res, 'Berhasil menambahkan favorit');
    } catch (error) {
      return next(error);
    }
  }

  static async deleteFavorit(req, res, next) {
    try {
      console.log('[LOG]: delete favorit', req.body);
      const { product_id } = req.body;

      const decode = req.payload;
      const favorit = await Favorit.findOne({
        where: { user_id: decode.id, product_id },
      });

      if (!favorit) {
        return outputParser.error(req, res, 'Favorit not found');
      }

      await favorit.destroy();

      return outputParser.success(req, res, 'Berhasil menghapus favorit');
    } catch (error) {
      return next(error);
    }
  }

  static async favorit(req, res, next) {
    try {
      console.log('[LOG]: get favorit', req.body);

      const token = req.header('authorization').split(' ')[1];
      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }
      let decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET); // Verify Token

      const user_id = +decode.id;
      const favorites = await Favorit.findAll({
        attributes: ['user_id', 'product_id'],
        where: {
          user_id: user_id,
        },
      });

      const productIds = favorites.map((favorite) => favorite.product_id);

      const products = await Products.findAll({
        where: {
          id: productIds,
        },
      });

      const productsWithPrice = products.map((product) => {
        const price = (product.base_price * product.discount) / 100;
        return {
          ...product.toJSON(),
          price: price,
        };
      });

      return outputParser.success(req, res, 'Get Favorite Success', {
        products: productsWithPrice,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async searchProductFovorit(req, res) {
    try {
      console.log('[LOG]: SearchProductFavorit', req.query);
      const keyword = req.query.q;

      const decode = req.payload;

      const user_id = +decode.id;
      const favorites = await Favorit.findAll({
        attributes: ['user_id', 'product_id'],
        where: {
          user_id: user_id,
        },
      });

      const ids = favorites.map((favorite) => favorite.product_id);
      let products = [];

      if (ids.length > 0) {
        products = await Products.findAll({
          include: {
            model: Categories,
            attributes: ['id', 'category_name'],
          },
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          where: {
            id: ids,
            [Op.or]: [
              { product_name: { [Op.iLike]: `%${keyword}%` } },
              { description: { [Op.iLike]: `%${keyword}%` } },
            ],
          },
          raw: true,
          nest: true,
        });
      }

      if (products.length > 0) {
        products = products.map((product) => {
          const price = product.base_price * ((100 - product.discount) / 100);
          return {
            ...product,
            price: price,
          };
        });
      } else {
        console.log('Maaf, tidak ada produk yang sesuai dengan kriteria pencarian.');
      }

      return outputParser.success(req, res, 'Seach Product Success', { products: products });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async subscribe(req, res, next) {
    try {
      console.log('[LOG]: subscribe', req.body);
      const { products, period, date, notes } = req.body;

      const decode = req.payload;
      const user_id = decode.id;

      // Update status keranjang menjadi true
      await Cart.update({ status: true }, { where: { user_id } });

      // Mendapatkan tanggal saat ini dengan format 'DDMMYY'
      const currentDate = new Date()
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
        .replace(/\//g, '');

      // Mendapatkan nilai terakhir dari subscribe_detail dalam database
      const lastSubscribe = await Subscribe.findOne({
        order: [['id', 'DESC']],
      });

      // Mendapatkan kode invoice unik berdasarkan nilai terakhir dalam database
      const codeInvoice = lastSubscribe
        ? String(Number(lastSubscribe.subscribe_detail.slice(-6)) + 1).padStart(6, '0')
        : '000001';

      const productIds = products.map((product) => product.product_id);

      // Mendapatkan data produk berdasarkan productIds
      const dataproducts = await Products.findAll({
        where: { id: productIds },
      });
      // console.log({ dataproducts });

      let total_price = 0;

      dataproducts.forEach((product) => {
        const purchasedQuantity = products.find((p) => p.product_id === product.id).qty;
        console.log({ purchasedQuantity });
        const total = product.base_price * purchasedQuantity * ((100 - product.discount) / 100);
        product.total = total;
        total_price += total;
      });
      console.log({ dataproducts2: dataproducts, total_price });

      // Mengurangi stok produk yang dibeli
      for (const product of dataproducts) {
        const purchasedQuantity = products.find((p) => p.product_id === product.id).qty;
        const remainingStock = product.stock - purchasedQuantity;

        if (remainingStock < 0) {
          // Jika stok tidak mencukupi, kirimkan response error
          return res
            .status(400)
            .json({ message: `Insufficient stock for product: ${product.name}` });
        }

        // Update stok produk
        await product.update({ stock: remainingStock });
      }

      const subscribe = {
        subscribe_detail: `GROSRI${currentDate}${codeInvoice}`,
        total_product: productIds.length,
        total_belanja: total_price, // 0
        status: constant.PRODUCT_STATUS.WAITING_CONFIRMED,
        product_id: productIds,
        user_id: decode.id,
        period,
        date,
        noted: notes,
      };

      const createdSubscribe = await Subscribe.create(subscribe);

      // Lakukan pemetaan nilai subscribe_detail di dalam respons
      const originalSubscribeDetail = subscribe.subscribe_detail;
      const storeName = originalSubscribeDetail.substring(0, 5);
      const day = originalSubscribeDetail.substring(6, 8);
      const month = originalSubscribeDetail.substring(8, 10);
      const year = originalSubscribeDetail.substring(10, 12);
      const purchaseOrder = originalSubscribeDetail.substring(12);
      const mappedSubscribeDetail = `INV/${day}${month}${year}/${storeName.replace(
        'O',
        ''
      )}/${purchaseOrder}`;

      console.log({ createdSubscribe });

      await SubscribeHistory.create({
        jumlah: productIds.length,
        sisa: 0,
        invoice: mappedSubscribeDetail,
        status: constant.PRODUCT_STATUS.WAITING_CONFIRMED,
        subscribe_id: createdSubscribe.id,
        user_id: decode.id,
      });

      await Cart.update(
        { status: true, subscribe_id: createdSubscribe.toJSON().id }, // Nilai yang akan diperbarui
        { where: { user_id, subscribe_id: null } } // Kriteria untuk memfilter baris yang akan diperbarui
      );

      const saldo = await LimitValue.findOne({ where: { user_id: decode.id } });
      if (saldo && saldo.saldo_limit) {
        saldo.saldo_limit -= total_price;
        await saldo.save();
      }

      return outputParser.success(req, res, 'Subscribe Success', {
        subscribe: createdSubscribe.toJSON(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateSubscribe(req, res) {
    console.log('[LOG]: cancel subscribe');
    try {
      const { subscribe_id, status, noted } = req.body;

      const decode = req.payload;

      const user_id = decode.id;
      console.log({ id: subscribe_id, user_id });
      const subscribe = await Subscribe.findOne({
        where: {
          id: subscribe_id,
          user_id,
          // status: false,
        },
      });

      if (!subscribe) {
        return outputParser.error(req, res, 'Subscribe not found', 404);
      }

      // Update status dan catatan di subscribe
      subscribe.status = status;
      subscribe.noted = noted;
      await subscribe.save();

      if (status == 'UNSUBSCRIBE' || status == 'CANCELLED') {
        await Notification.create({
          title: 'Belanjaan Dibatalkan',
          message: 'Pesanan anda sudah dibatalkan',
          userId: decode.id,
          isRead: false,
          where: {
            userId: decode.id,
          },
        });

        // Mengambil semua keranjang berlangganan (carts) yang memiliki status true dan terkait dengan langganan tertentu (subscribe)
        const carts = await Cart.findAll({
          where: {
            subscribe_id: subscribe.id,
            status: true,
          },
          raw: true,
          nest: true,
        });

        console.log({ carts }); // Menampilkan data carts di konsol untuk keperluan debug

        // Mendapatkan daftar product_id dari setiap item dalam keranjang berlangganan
        const productIds = carts.map((cart) => cart.product_id);
        console.log({ productIds });

        // Mengambil data produk dari database berdasarkan productIds yang telah didapatkan sebelumnya
        const products = await Products.findAll({
          where: {
            id: productIds,
          },
        });

        // Melakukan perulangan untuk setiap item dalam keranjang berlangganan
        carts.forEach((cart) => {
          // Mencari produk yang sesuai dengan product_id dari keranjang
          const product = products.find((product) => product.id === cart.product_id);
          console.log({ product });
          // Jika produk ditemukan, maka lakukan update stok produk dengan menambahkan quantity dari keranjang
          if (product) {
            product.stock += cart.quantity;
            // Menyimpan perubahan stok produk ke database
            product.save();
          }
        });

        // Menampilkan data carts yang telah diperbarui dengan stok produk terbaru
        console.log({ carts });
      }

      return outputParser.success(req, res, 'Succes Update Statu Subscribe Success', {
        subscribe: subscribe.toJSON(),
      });
    } catch (err) {
      return outputParser.error(req, res, 'Gagal Update status Subscribe Success');
    }
  }

  static async getSubscribeMonth(req, res, next) {
    try {
      const period = 'month';

      let decode = req.payload; //Verify Token
      const user_id = decode.id;
      console.log({ decode });

      const subscribes = await Subscribe.findAll({
        // include: [
        //   {
        //     model: SubscribeHistory,
        //     as: 'subscribe_histories', // Sesuaikan dengan nama asosiasi di model Subscribe
        //   },
        // ],
        where: {
          period,
          user_id,
        },
        raw: true,
        nest: true,
      });

      const productIds = subscribes.flatMap((subscribe) => subscribe.product_id);
      const products = await Products.findAll({
        where: {
          id: productIds,
        },
      });

      const subscribeList = subscribes.map((subscribe) => {
        const totalPrice = subscribe.product_id.reduce((total, productId) => {
          const product = products.find((p) => p.id === productId);
          const discountAmount = (product.base_price * product.discount) / 100;
          if (product) {
            return total + product.base_price - discountAmount;
          }
          return total;
        }, 0);
        console.log({ subscribe });
        console.log({ TEST: subscribe.subscribe_histories });

        const image = subscribe.product_id.map((productId) => {
          const product = products.find((p) => p.id === productId);
          return product ? product.image : null;
        });

        return {
          id: subscribe.id,
          image,
          subscribe_detail: subscribe.subscribe_detail,
          total_product: subscribe.total_product,
          total_belanja: totalPrice,
          status: subscribe.status,
          subscribe_date: subscribe.createdAt,
        };
      });

      return outputParser.success(req, res, 'Get Subscribe Month List Success', { subscribeList });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  static async getSubscribeWeek(req, res, next) {
    try {
      const period = 'week';

      const token = req.header('authorization').split(' ')[1];
      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }

      let decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET); //Verify Token
      const user_id = decode.id;

      const subscribes = await Subscribe.findAll({
        // include: [
        //   {
        //     model: SubscribeHistory,
        //     as: 'subscribe_histories', // Sesuaikan dengan nama asosiasi di model Subscribe
        //   },
        // ],
        where: {
          period,
          user_id,
        },
        raw: true,
        nest: true,
      });

      const productIds = subscribes.flatMap((subscribe) => subscribe.product_id);
      const products = await Products.findAll({
        where: {
          id: productIds,
        },
      });

      const subscribeList = subscribes.map((subscribe) => {
        const totalPrice = subscribe.product_id.reduce((total, productId) => {
          const product = products.find((p) => p.id === productId);
          const discountAmount = (product.base_price * product.discount) / 100;
          if (product) {
            return total + product.base_price - discountAmount;
          }
          return total;
        }, 0);
        console.log({ subscribe });
        console.log({ TEST: subscribe.subscribe_histories });

        const image = subscribe.product_id.map((productId) => {
          const product = products.find((p) => p.id === productId);
          return product ? product.image : null;
        });

        return {
          id: subscribe.id,
          image,
          subscribe_detail: subscribe.subscribe_detail,
          total_product: subscribe.total_product,
          total_belanja: totalPrice,
          status: subscribe.status,
          subscribe_date: subscribe.createdAt,
        };
      });

      return outputParser.success(req, res, 'Get Subscribe Month List Success', { subscribeList });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async createSuggestProduct(req, res, next) {
    try {
      console.log('[LOG]: add Suggest Product', req.body);
      const { suggest_product } = req.body;
      await suggest_products.create({ suggest_product });
      return outputParser.create(req, res, 'Berhasil menambahkan Recomend');
    } catch (error) {
      return next(error);
    }
  }

  static async detailSubscribe(req, res, next) {
    try {
      console.log('[LOG]: Detail subscribe', req.body);

      let decode = req.payload;
      const user_id = decode.id;

      const foundSubscribe = await Subscribe.findOne({
        where: {
          user_id,
          subscribe_detail: req.query.subscribe_id,
        },
        raw: true,
        nest: true,
      });

      // cart berisi subscriber
      const cart = await Cart.findAll({
        where: { subscribe_id: foundSubscribe.id, status: true },
        attributes: ['id', 'subscribe_id', 'quantity', 'product_id'],
        raw: true,
        nest: true,
      });

      // console.log({ cart });
      const productIds = cart.map((item) => item.product_id);

      const person = await Users.findOne({ where: { email: decode.email } });

      if (!foundSubscribe) {
        return res.status(404).json({ message: 'Subscribe not found' });
      }

      // Lakukan pemetaan nilai subscribe_detail di dalam respons
      const originalSubscribeDetail = foundSubscribe.subscribe_detail;
      const storeName = originalSubscribeDetail.substring(0, 5);
      const day = originalSubscribeDetail.substring(6, 8);
      const month = originalSubscribeDetail.substring(8, 10);
      const year = originalSubscribeDetail.substring(10, 12);
      const purchaseOrder = originalSubscribeDetail.substring(12);
      const mappedSubscribeDetail = `INV/${day}${month}${year}/${storeName.replace(
        'O',
        ''
      )}/${purchaseOrder}`;

      const mappedSubscribe = {
        ...foundSubscribe,
        subscribe_detail: mappedSubscribeDetail, // Ubah sesuai dengan pemetaan yang diinginkan
      };

      // const productIds = foundSubscribe.product_id; // Ambil daftar product_id dari foundSubscribe
      const groceries = await Products.findAll({
        where: {
          id: productIds,
        },
        attributes: [
          'id',
          // ['product_name', 'name'], // Menggunakan Sequelize.literal untuk mengubah product_name menjadi alias name
          'product_name',
          'base_price',
          'discount',
          'image',
        ],
        raw: true,
        nest: true,
      });

      // Membuat objek untuk memetakan product_id ke cart.quantity
      const quantityMap = {};
      cart.forEach((item) => {
        quantityMap[item.product_id] = item.quantity;
      });

      // Menambahkan cart.quantity dan total discount ke masing-masing produk dalam array groceries
      let totalDiscount = 0;
      let subtotal = 0;
      groceries.forEach((product) => {
        product.quantity = quantityMap[product.id] || 0;

        // Menghitung total diskon per produk
        const discountAmount = (product.base_price * product.discount) / 100;
        const productDiscount = discountAmount * product.quantity;
        totalDiscount += productDiscount;
        product.discount = productDiscount;

        subtotal += product.base_price * product.quantity;
        product.base_price = product.base_price * product.quantity;
        product.price = product.base_price - productDiscount;
      });

      return outputParser.success(req, res, 'Subscribe Detail', {
        subscribe: mappedSubscribe,
        groceries, // done
        subscribe_id: person.subscriber_id,
        totalDiscount,
        subtotal, // done/
        cart,
        total: subtotal - totalDiscount, // done
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async gethistorySubscribeList(req, res, next) {
    try {
      console.log('[LOG]: gethistorySubscribeList', req.body);
      const subscribe_id = req.query.subscribe_id;

      let decode = req.payload;

      const listHistorySubscribes = await SubscribeHistory.findAll({
        where: {
          subscribe_id,
          user_id: decode.id,
          status: constant.PRODUCT_STATUS.ACCEPTED,
        },
      });

      // Mendapatkan createdAt dalam format yang diinginkan (misal: 'YYYY-MM-DD HH:mm:ss')
      const listHistorySubscribe = listHistorySubscribes.map((history) => ({
        id: history.id,
        createdAt: moment(history.created_at).format('YYYY-MM-DD HH:mm:ss'),
      }));
      return outputParser.success(req, res, 'Get List History Subscribe Success', {
        listHistorySubscribe,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getDetailHistorySubscribeList(req, res, next) {
    try {
      console.log('[LOG]: getDetailHistorySubscribe', req.body);
      // const { id } = req.body;
      const history_id = req.query.history_id;

      let decode = req.payload;

      const historySubscribe = await SubscribeHistory.findOne({
        where: {
          id: history_id,
          user_id: decode.id,
          status: constant.PRODUCT_STATUS.ACCEPTED,
        },
      });

      if (!historySubscribe) {
        return outputParser.error(req, res, 'Anda belum ada Subscribe History ');
      }

      const foundSubscribe = await Subscribe.findOne({
        where: {
          user_id: decode.id,
          id: historySubscribe.subscribe_id,
        },
      });

      const data_cart = await Cart.findAll({
        where: {
          user_id: decode.id,
          subscribe_id: foundSubscribe.id,
        },
        raw: true,
        nest: true,
      });

      const person = await Users.findOne({ where: { email: decode.email } });

      // const productIds = data_cart.map((cartItem) => cartItem.product_id);

      let totalPrice = 0;
      let totalDiscount = 0;

      for (const cartItem of data_cart) {
        const product = await Products.findOne({
          where: {
            id: cartItem.product_id,
          },
          raw: true,
        });

        totalPrice += product.base_price * cartItem.quantity;
        totalDiscount += ((product.base_price * product.discount) / 100) * cartItem.quantity;
      }

      // Mendapatkan createdAt dalam format yang diinginkan (misal: 'YYYY-MM-DD HH:mm:ss')
      const formattedHistorySubscribe = {
        id: historySubscribe.id,
        created_at: moment(historySubscribe.created_at).format('YYYY-MM-DD HH:mm:ss'),
        pick_up_date: moment(historySubscribe.updated_at).format('YYYY-MM-DD'),
        pick_up_time: moment(historySubscribe.updated_at).add(7, 'hours').format('HH:mm:ss'),
        status: 'diterima',
        invoice: historySubscribe.invoice,
        periode: foundSubscribe.period,
        recipient_name: person.full_name,
        count_product: data_cart.length,
        price: totalPrice - totalDiscount,
        discount: totalDiscount,
      };

      return outputParser.success(req, res, 'Get Detail History Subscribe Success', {
        historySubscribe: formattedHistorySubscribe,
        data_cart,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async historySubscribe(req, res, next) {
    try {
      console.log('[LOG]: subscribe', req.body);
      // const user_id = +req.body.user_id;
      const { products, period, date, notes } = req.body;

      const token = req.header('authorization').split(' ')[1];
      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }

      let decode = cekToken(token, process.env.JWT_ACCESS_TOKEN_SECRET); //Verify Token
      const email = decode.email;
      // dapatkan semua data cart yang status false
      const carts = await Cart.findAll({
        where: {
          email,
          status: false,
        },
      });
      // update status keranjang menjadi true
      carts.update(
        {
          status: true,
        },
        { where: { email } }
      );

      // Mendapatkan tanggal saat ini dengan format 'DDMMYY'
      const currentDate = new Date()
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
        .replace(/\//g, '');

      // Mendapatkan nilai terakhir dari subscribe_detail dalam database
      const lastSubscribe = await Subscribe.findOne({
        order: [['id', 'DESC']],
      });

      // Mendapatkan kode invoice unik berdasarkan nilai terakhir dalam database
      const codeInvoice = lastSubscribe
        ? String(Number(lastSubscribe.subscribe_detail.slice(-6)) + 1).padStart(6, '0')
        : '000001';

      const productIds = products.map((product) => product.product_id);

      const subscribe = {
        subscribe_detail: `GROSRI${currentDate}${codeInvoice}`,
        total_product: productIds.length,
        total_belanja: 0,
        status: false,
        product_id: productIds,
        period: period,
        date: date,
        notes: notes,
      };

      const createdSubscribe = await Subscribe.create(subscribe);

      // Mendapatkan data produk berdasarkan productIds
      const dataproducts = await Products.findAll({
        where: { id: productIds },
      });
      // console.log(dataproducts);

      // Menyimpan data produk ke dalam tabel Subscribe
      await createdSubscribe.addProducts(dataproducts);

      return outputParser.success(req, res, 'Subscribe Success', {
        subscribe: createdSubscribe.toJSON(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = {
  ProductController,
};

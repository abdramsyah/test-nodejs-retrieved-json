const { STATUS } = require('../../../config/constant');
const { cekToken } = require('../../../helpers/generalHelpers');
const Paginator = require('../../../helpers/paginator');
const { Events, Cart, Products, Categories } = require('../../../models');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');
const slugify = require('slugify');
const Op = require('sequelize').Op;

async function generateUniqueSlug(slug) {
  let newSlug = slug;
  let counter = 1;
  let foundUniqueSlug = false;

  while (!foundUniqueSlug) {
    const existingEvent = await Events.findOne({ slug: newSlug });
    if (!existingEvent) {
      foundUniqueSlug = true;
      return newSlug;
    }

    newSlug = `${slug}-${counter}`;
    counter++;
  }
}

async function generateUniqueSlugV2(slug) {
  let newSlug = slug;
  let counter = 1;
  const maxAttempts = 10; // Batasan jumlah percobaan

  while (counter <= maxAttempts) {
    const existingEvent = await Events.findOne({ where: { slug: newSlug } });
    if (!existingEvent) {
      return newSlug;
    }

    newSlug = `${slug}-${counter}`;
    counter++;
  }

  throw new Error(`Gagal menghasilkan slug unik setelah ${maxAttempts} percobaan.`);
}

class PromoController {
  static async addEvent(req, res, next) {
    try {
      console.log('[LOG]: add Promo', req.body);

      const token = req.payload;
      if (!token) {
        return next({ name: 'RefreshTokenIsRequired' });
      }

      const { event_name, start_date, end_date } = req.body;

      // Generate unique slug from event_name
      const slug = slugify(event_name, { lower: true });

      // Check if slug already exists in the table
      const existingEvent = await Events.findOne({
        where: { slug },
      });
      if (existingEvent) {
        // Generate a new unique slug
        const uniqueSlug = generateUniqueSlug(slug);

        // Create the event with the new unique slug
        const newEvent = await Events.create({
          event_name,
          start_date,
          end_date,
          slug: uniqueSlug,
          status: 'ACTIVE',
        });
        return outputParser.create(req, res, 'Berhasil menambahkan Event', newEvent);
      }

      // Create the event with the generated slug
      const newEvent = await Events.create({
        event_name,
        start_date,
        end_date,
        slug,
        status: 'ACTIVE',
      });
      return outputParser.create(req, res, 'Berhasil menambahkan Event', newEvent);
    } catch (error) {
      return next(error);
    }
  }

  static async getEvent(req, res) {
    try {
      console.log('[LOG]: get Event', req.params);

      // Mendapatkan query parameter "id" dari permintaan
      const slug = req.params.slug;
      // const slug = req.query.slug
      const events = await Events.findOne({
        include: {
          model: Products,
          limit: 5,
          attributes: [
            'id',
            'product_name',
            'base_price',
            'base_price_discount',
            'discount',
            'discount_percentage',
            'prioritas',
            'status',
            'image',
          ],
        },
        // Menambahkan kondisi WHERE berdasarkan ID
        where: {
          // id: eventId
          slug: slug,
        },
        attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });

      let template = {
        id: events.id,
        event_name: events.event_name,
        slug: events.slug,
        start_date: events.start_date,
        end_date: events.end_date,
        Products: events.Products.map((product) => ({
          id: product.id,
          product_name: product.product_name,
          base_price: product.base_price,
          base_price_discount: product.base_price_discount,
          discount: product.discount,
          discount_percentage: product.discount_percentage,
          prioritas: product.prioritas,
          status: product.status,
          image: product.image,
          price: product.discount ? product.base_price_discount : product.base_price,
        })),
      };

      return outputParser.success(req, res, 'Get Event Success', template);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  static async getPromo(req, res) {
    try {
      console.log('[LOG]: get Promo', req.body);

      // Mendapatkan parameter ":params" dari permintaan
      const slug = req.params.slug;

      const events = await Events.findAll({
        include: {
          model: Products,
          limit: 5,
        },
        // Menambahkan kondisi WHERE berdasarkan ID
        where: { slug },
        attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });

      // Memodifikasi event dan produk dengan menghitung harga diskon
      const modifiedEvents = events.map((event) => {
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

      let tmp = modifiedEvents[0];

      // return outputParser.successCustom(req, res, 'Get Promo Success', {

      //   tmp
      // });

      return res.status(200).send({
        success: true,
        message_client: 'Get Promo Success',
        data: tmp,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getDetailPromo(req, res) {
    try {
      console.log('[LOG]: get Promo', req.body);

      // Mendapatkan parameter ":params" dari permintaan
      const slug = req.params.slug;

      const events = await Events.findAll({
        include: {
          model: Products,
          limit: 5,
        },
        // Menambahkan kondisi WHERE berdasarkan ID
        where: { slug },
        // attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });

      // Memodifikasi event dan produk dengan menghitung harga diskon
      const modifiedEvents = events.map((event) => {
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

      let tmp = modifiedEvents[0];

      // return outputParser.successCustom(req, res, 'Get Promo Success', {

      //   tmp
      // });

      return res.status(200).send({
        success: true,
        message_client: 'Get Promo Success',
        data: tmp,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteEvent(req, res, next) {
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
        await existingCartItem.save();
        return outputParser.create(req, res, 'Berhasil mengurangi dari Keranjang');
      } else {
        // Jika kuantitas yang ingin dikurangi melebihi kuantitas yang ada, hapus item dari keranjang
        await existingCartItem.destroy();
        return outputParser.create(req, res, 'Berhasil menghapus dari Keranjang');
      }
    } catch (error) {
      return next(error);
    }
  }

  static async promoSection(req, res, next) {
    try {
      const data = {};

      const events = await Events.findAll({
        include: {
          model: Products,
          limit: 5,
        },
        where: {
          id: {
            [Op.not]: 2,
          },
        },
        attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });

      const modifiedEvents = events.map((event) => {
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

      const recomendation = await Events.findAll({
        include: {
          model: Products,
          limit: 5,
        },
        // Menambahkan kondisi WHERE berdasarkan ID
        where: { id: 2 },
        attributes: ['id', 'event_name', 'slug', 'start_date', 'end_date'],
      });

      // Memodifikasi event dan produk dengan menghitung harga diskon
      const recomendations = recomendation.map((event) => {
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

      data.event = modifiedEvents;
      data.recomendation = recomendations;

      return outputParser.success(req, res, 'Get Data Promo Berhasil', data);
    } catch (error) {
      Log.error(error);
      return outputParser.internalServerError(req, res, 'Internal Server error');
    }
  }

  /* ::: OPERATIONS ::: */

  static async listPromo(req, res) {
    let queryResult = null;
    let { page, size: limit, search } = req.query;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    try {
      // let where = { status: [STATUS.ACTIVE, STATUS.INACTIVE] };
      let where = {};
      if (search) {
        Object.assign(where, {
          full_name: { [Op.iLike]: `%${search}%` },
        });
      }

      queryResult = await Events.findAndCountAll({
        attributes: [
          'id',
          'event_name',
          'start_date',
          'end_date',
          'prioritas',
          'status',
          // 'is_active',
        ],
        where,
        limit,
        offset,
      });

      let template = {
        count: queryResult.count,
        rows: queryResult.rows.map((event) => ({
          id: event.id,
          event_name: event.event_name,
          start_date: event.start_date,
          end_date: event.end_date,
          prioritas: event.prioritas || 1,
          status: event.status || 'ACTIVE',
        })),
      };

      paging.setData(template);
      const resp = paging.getPaginator();
      return outputParser.success(req, res, 'Get List Promo Success', resp);
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
      s;
    }
  }

  static async createPromo(req, res) {
    const { event_name, start_date, end_date, product_ids, prioritas } = req.body;

    try {
      const slug = slugify(event_name, { lower: true });

      const existingEvent = await Events.findOne({ where: { slug } });

      if (existingEvent) {
        const uniqueSlug = await generateUniqueSlugV2(slug);

        await Events.create({
          event_name,
          slug: uniqueSlug,
          start_date,
          end_date,
          // product_ids,
          prioritas,
          // status: 'ACTIVE',
        });

        return outputParser.create(req, res, 'Promosi berhasil dibuat');
      }

      await Events.create({
        event_name,
        slug,
        start_date,
        end_date,
        // product_ids,
        prioritas,
        // status: 'ACTIVE',
      });

      return outputParser.success(req, res, 'Promosi berhasil dibuat');
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, '');
    }
  }
}

module.exports = {
  PromoController,
};

const constant = require('../../../config/constant');
const Paginator = require('../../../helpers/paginator');
const { validationResult } = require('express-validator');
const Op = require('sequelize').Op;
const {
  Categories,
  Orders,
  OrderProducts,
  OrderHistories,
  Users,
  Products,
  Sequelize,
} = require('../../../models');
const moment = require('moment');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');

class CategoryController {
  static async createNewCategory(req, res) {
    try {
      const decode = req.payload;
      const errors = validationResult(req);
      Log.error({ errors: errors.Result });

      if (!errors.isEmpty()) {
        Log.error(errors);
        return outputParser.errorValidatorFirst(req, res, errors);
      }

      const { category_name, description, sort, status } = req.body;

      let categoryName = category_name.replace(/(\b\w)/g, (match) => match.toUpperCase());

      // const existingUser = await Categories.findOne({ where: { category_name } });
      // if (existingUser) {
      //   return outputParser.errorCustom(req, res, 'Email sudah terdaftar');
      // }

      await Categories.create({
        category_name: categoryName,
        description,
        image: req.image,
        sort,
        status,
        created_by: decode.full_name,
        updated_by: decode.full_name,
      });

      return outputParser.success(req, res, 'Create Category Success');
    } catch (err) {
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  static async getListCategories(req, res) {
    let queryResult = null;
    let { page, size: limit, search, sort, direction = 'ASC' } = req.query;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    try {
      // let where = { status: [constant.STATUS.ACTIVE, constant.STATUS.INACTIVE] };
      let where = {};
      let order = [];
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            {
              category_name: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        });
      }

      if (sort && direction) {
        order.push([sort, direction]);
      } else {
        order.push(['sort', 'ASC'], ['category_name', 'ASC']);
      }

      queryResult = await Categories.findAndCountAll({
        where,
        limit,
        offset,
        attributes: ['id', 'category_name', 'image', 'sort', 'status'],
        order,
      });

      let template = {
        count: queryResult.count,
        rows: queryResult.rows.map((category) => ({
          id: category.id,
          category_name: category.category_name,
          image: category.image,
          sort: category.sort,
          status: category.status,
        })),
      };

      paging.setData(template);
      const resp = paging.getPaginator();
      return outputParser.success(req, res, 'List Categories Success', resp);
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async getCategoryById(req, res) {
    // const decode = req.payload;

    const categoryId = req.params.id;

    try {
      const category = await Categories.findOne({
        where: { id: categoryId },
        attributes: [
          'id',
          'category_name',
          'description',
          'image',
          'sort',
          'status',
          'created_by',
          'updated_by',
          'created_at',
          'updated_at',
        ],
      });

      if (category) {
        let template = {
          id: category.id,
          category_name: category.category_name,
          description: category.description,
          image: category.image,
          sort: category.sort,
          status: category.status,
          created_by: category.created_by,
          updated_by: category.updated_by,
          created_at: category.created_at,
          updated_at: category.updated_at,
        };
        return outputParser.success(req, res, 'Category Details', template);
      } else {
        return outputParser.notFound(req, res, 'Category not found');
      }
    } catch (err) {
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async updateCategory(req, res) {
    try {
      const errors = validationResult(req);
      const decode = req.payload;

      if (!errors.isEmpty()) {
        Log.error(errors);
        return outputParser.errorValidatorFirst(req, res, errors);
      }

      const categoryId = req.params.id; // Mengambil ID kategori dari parameter rute
      const { category_name, description, sort, status } = req.body;

      if (sort === '' || isNaN(Number(sort))) {
        return outputParser.unprocessableEntity(
          req,
          res,
          'Format tidak sesuai, harus menggunakan angka'
        );
      }

      let categoryName = category_name.replace(/(\b\w)/g, (match) => match.toUpperCase());

      const category = await Categories.findByPk(categoryId);

      if (!category) {
        return outputParser.notFound(req, res, 'Category not found');
      }

      category.category_name = categoryName;
      category.description = description;
      category.image = req.image;
      category.sort = sort;
      category.status = status;
      category.updated_by = decode.full_name;

      // Jika Anda ingin memperbarui gambar juga, Anda dapat menambahkannya di sini.
      // category.image = req.image;

      await category.save(); // Menyimpan perubahan ke dalam database

      return outputParser.success(req, res, 'Update Category Success');
    } catch (err) {
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  static async deleteCategory(req, res) {
    try {
      const categoryId = 1; // Mengambil ID kategori dari parameter rute

      const category = await Categories.findByPk(categoryId);

      if (!category) {
        return outputParser.notFound(req, res, 'Category not found');
      }

      if (category.status == 'ACTIVE') {
        return outputParser.unprocessableEntity(
          req,
          res,
          'Category status is still ACTIVE, please set it to INACTIVE before deleting.'
        );
      }

      await category.destroy(); // Menghapus kategori dari database

      return outputParser.success(req, res, 'Delete Category Success');
    } catch (err) {
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

  static async getListOrders(req, res) {
    let queryResult = null;
    let { page, size: limit, search, status, sort, direction = 'ASC' } = req.query;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    try {
      let where = {};
      let order = [];

      if (search) {
        where[Op.or] = [
          Sequelize.literal(`"user"."full_name" iLIKE '%${search}%'`),
          Sequelize.literal(`"Orders"."order_number" iLIKE '%${search}%'`),
        ];
      }

      if (status) {
        Object.assign(where, {
          status: { [Op.iLike]: `${status}` },
        });
      }

      if (sort && direction) {
        order.push([sort, direction]);
      } else {
        order.push(['updated_at', 'DESC']);
      }

      queryResult = await Orders.findAndCountAll({
        attributes: ['id', 'order_number', 'total', 'status', 'user_id'],
        where: where,
        limit,
        offset,
        order,
        include: [
          {
            model: Users,
            as: 'user',
            attributes: ['full_name'],
          },
        ],
      });

      paging.setData(queryResult);
      const resp = paging.getPaginator();
      return outputParser.success(req, res, 'List Orders Success', {
        list_categories: resp,
      });
    } catch (err) {
      Log.error('[LOG]: ', err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async getDetailOrders(req, res) {
    let queryResult = null;
    const order_number = req.params.id;

    try {
      let where = {};
      if (order_number) {
        Object.assign(where, {
          order_number: { [Op.substring]: `%${order_number}%` },
        });
      }
      queryResult = await Orders.findOne({
        attributes: [
          'id',
          'order_number',
          'payment',
          'total',
          'sub_total',
          'status',
          'user_id',
          'date_pickup',
          'total_product',
          'created_at',
        ],
        where,
        order: [['created_at', 'ASC']],
        include: [
          {
            model: Users,
            as: 'user',
            attributes: ['full_name', 'phone', 'email'],
          },
          {
            model: OrderProducts,
            OrderHistories,
            as: 'order_products',
            include: [
              {
                model: Products,
                as: 'product',
                attributes: [
                  'product_name',
                  'image',
                  'stock',
                  'base_price',
                  'base_price_discount',
                  'discount',
                  'discount_price',
                  'discount_percentage',
                ],
              },
            ],
          },
          {
            model: OrderHistories,
            as: 'order_histories',
            limit: 1,
            order: [['createdAt', 'DESC']],
            // attributes: ['full_name', 'phone', 'email'],
          },
        ],
      });

      if (!queryResult) {
        return outputParser.error(req, res, 'Order not found', 404);
      }
      const formattedResult = {
        id: queryResult.id,
        user_id: queryResult.user_id,
        // created_at: queryResult.created_at,
        user: {
          full_name: queryResult.user.full_name,
          phone: queryResult.user.phone,
          email: queryResult.user.email,
        },
        order_information: {
          status: queryResult.status,
          order_number: queryResult.order_number,
          date_order: moment(queryResult.created_at).format('YYYY-MM-DD'),
          time_order: `${moment(queryResult.created_at).format('HH:mm:ss')} WIB`,
          date_pickup: queryResult.date_pickup,
          total_product: `${queryResult.total_product} Barang`,
          date_finish:
            queryResult.status == 'FINISH'
              ? moment(queryResult.order_histories.createdAt).format('DD MMMM YYYY')
              : null,
          date_canceled:
            queryResult.status == 'CANCELLED'
              ? moment(queryResult.order_histories.deletedAt).format('DD MMMM YYYY')
              : null,
        },
        payment_details: {
          payment: queryResult.payment == 'CASH' ? 'Pembayaran di Gerai' : 'Pembayaran via Link',
          sub_total: queryResult.sub_total,
          discount: queryResult.sub_total - queryResult.total,
          total: queryResult.total,
        },
        shopping_list: queryResult.order_products.map((orderProduct) => ({
          product_name: orderProduct.product.product_name,
          image: orderProduct.product.image,
          quantity: `${orderProduct.quantity} Barang`,
          base_price: orderProduct.base_price,
          base_price_discount: orderProduct.base_price_discount,
          discount: orderProduct.discount,
          discount_percentage: orderProduct.product.discount_percentage,
          discount_price: orderProduct.discount_price,
        })),
        // order_histories: queryResult.order_histories,
      };

      return outputParser.success(req, res, 'Detail Orders Success', {
        formattedResult,
        // queryResult,
      });
    } catch (err) {
      Log.error('[LOG]: ', err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }
}

module.exports = {
  CategoryController,
};

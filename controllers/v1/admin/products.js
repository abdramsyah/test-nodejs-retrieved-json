const constant = require('../../../config/constant');
const Paginator = require('../../../helpers/paginator');
const { validationResult } = require('express-validator');
const Op = require('sequelize').Op;
const { Products, Categories, Sequelize } = require('../../../models');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');

class ProductController {
  static async createNewProduct(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        Log.error(errors);
        return outputParser.errorValidatorFirst(req, res, errors);
      }

      const {
        product_name,
        description,
        stock,
        category_id,
        base_price,
        base_price_discount,
        discount_price,
        discount,
        discount_type,
        prioritas,
        status,
      } = req.body;

      // Perbaikan: Menggunakan "photo" dari req.body untuk gambar produk
      console.log({ object: req.image });
      const image = req.image;

      // if (!image) {
      //   return outputParser.errorCustom(req, res, 'URL gambar produk diperlukan', null);
      // }

      const data = {
        product_name,
        description,
        image,
        stock,
        category_id,
        base_price,
        base_price_discount,
        discount_price,
        discount,
        discount_type,
        prioritas: (prioritas = 0 ? null : prioritas),
        status,
      };

      await Products.create(data);

      return outputParser.success(req, res, 'Berhasil menambahkan produk');
    } catch (err) {
      Log.error(err);
      return outputParser.errorCustom(req, res, err, null);
    }
  }

  static async getListProducts(req, res) {
    let queryResult = null;
    let { page, size: limit, search, category, sort, direction = 'ASC' } = req.query;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    limit = limit ? limit : 10;

    try {
      let whereProduct = {};
      let whereCategory = {};
      let order = [];

      if (search) {
        whereProduct[Op.or] = [
          {
            product_name: { [Op.iLike]: `%${search}%` },
            deleted_at: {
              [Op.is]: null,
            },
          },
        ];
      } else {
        whereProduct.deleted_at = {
          [Op.is]: null,
        };
      }

      if (category) {
        whereCategory[Op.or] = [{ id: category }];
      }

      if (sort && direction) {
        order.push([sort, direction]);
      } else {
        // order.push(['product_name', 'ASC']);
        order.push(['prioritas', 'ASC']);
      }

      queryResult = await Products.findAndCountAll({
        where: whereProduct,
        limit,
        offset,
        order,
        include: [
          {
            model: Categories,
            attributes: ['category_name'],
            where: whereCategory,
          },
        ],
      });
      let data = {
        count: queryResult.count,
        rows: queryResult.rows.map((product) => ({
          id: product.id,
          // category_id: product.category_id,

          image: product.image,
          product_name: product.product_name,
          description: product.description,
          // description_product: product.description_product,

          category_name: product.Category.category_name,
          base_price: product.base_price,
          quantity: product.stock,
          discount: product.discount,
          discount_type: product.discount_type,
          base_price_discount: product.base_price_discount,
          prioritas: product.prioritas,
          status: product.status,
          created_at: product.createdAt,
          created_by: 'test dulu yak',
          updated_by: 'test dulu yak',
          updated_at: product.updatedAt,
        })),
      };

      paging.setData(data);
      const resp = paging.getPaginator();
      return outputParser.success(req, res, 'List Products Success', resp);
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async getListCategories(req, res) {
    let queryResult = null;
    try {
      let where = { status: [constant.STATUS.ACTIVE], deleted_at: null };

      queryResult = await Categories.findAll({
        where,
        attributes: ['id', 'category_name'],
        order: [
          ['sort', 'ASC'],
          // ['updated_at', 'DESC'],
        ],
      });

      return outputParser.success(req, res, 'List Categories Product Success', queryResult);
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async getProductById(req, res) {
    const id = req.params.id;

    try {
      const product = await Products.findOne({
        attributes: [
          'id',
          // 'category_id',
          'image',
          'product_name',
          'description',
          'base_price',
          'stock',
          'discount',
          'base_price_discount',
          'discount_type',
          'discount_price',
          'prioritas',
          'status',
          'createdAt',
          'updatedAt',
        ],
        include: [
          {
            model: Categories,
            // as: 'Categories',
            // attributes: ['category_name'],
            // where: where_user,
          },
        ],
        where: {
          id,
          deleted_at: {
            [Op.is]: null,
          },
        },
      });

      if (product) {
        let template = {
          id: product.id,

          image: product.image,
          product_name: product.product_name,
          description: product.description,

          category_name: product.Category.category_name,
          base_price: product.base_price,
          quantity: product.stock,
          discount: product.discount,
          base_price_discount: product.base_price_discount,
          discount_type: product.discount_type,
          discount_price: product.discount_price,
          prioritas: product.prioritas,
          status: product.status,
          created_at: product.createdAt,
          created_by: 'test dulu yak',
          updated_by: 'test dulu yak',
          updated_at: product.updatedAt,

          // is_event_product: product.is_event_product,
          // event_id: product.event_id,
          // discount_price: product.discount_price,
        };
        return outputParser.success(req, res, 'Product Details', template);
      } else {
        return outputParser.notFound(req, res, 'Product not found');
      }
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async updateProduct(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        Log.error(errors);
        return outputParser.errorValidatorFirst(req, res, errors);
      }

      const productId = req.params.id;
      const {
        product_name,
        description,
        stock,
        category_id,
        base_price,
        base_price_discount,
        discount_price,
        discount,
        discount_type,
        prioritas,
        status,
      } = req.body;

      const product = await Products.findByPk(productId);

      if (!product) {
        return outputParser.notFound(req, res, 'Product not found');
      }

      console.log({ object: req.image });
      const image = req.image;

      product.product_name = product_name;
      product.description = description;
      product.image = image;
      product.stock = stock;
      product.category_id = category_id;
      product.base_price = base_price;
      product.base_price_discount = base_price_discount;
      product.discount_price = discount_price;
      product.discount = discount;
      product.discount_type = discount_type;
      product.prioritas = prioritas = 0 ? null : prioritas;
      product.status = status;

      await product.save();

      return outputParser.success(req, res, 'Update Product Success');
    } catch (err) {
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  static async deleteProduct(req, res) {
    const productId = req.params.id;

    try {
      const product = await Products.findByPk(productId);

      if (!product) {
        return outputParser.notFound(req, res, 'Product not found');
      }

      if (product.status == 'ACTIVE') {
        return outputParser.badRequest(
          req,
          res,
          'Product masih aktive, silahkan ubah status menjadi inative'
        );
      }

      product.deleted_at = new Date();
      product.save();

      return outputParser.success(req, res, 'Produk berhasil dihapus');
    } catch (err) {
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }
}

module.exports = {
  ProductController,
};

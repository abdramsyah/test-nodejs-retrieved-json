const { Banners, Company } = require('../../../models');
const { outputParser } = require('../../../utils/outputParser');
const { ROLES } = require('../../../config/constant');
const Op = require('sequelize').Op;
const Paginator = require('../../../helpers/paginator');
const { Log } = require('../../../utils/customLog');

class BannerController {
  static async getListBannerPWA(req, res) {
    let queryResult = null;

    try {
      // let where = { role: [ROLES.OPERATION, ROLES.SUPER_ADMIN], deleted_at: null };

      queryResult = await Banners.findAndCountAll({
        attributes: ['id', 'name', 'image', 'url', 'start_date', 'end_date', 'prioritas', 'status'],
        // // where,
        order: [['prioritas', 'ASC']],
      });

      // let template = {
      //   count: queryResult.count,
      //   rows: queryResult.rows.map((banner) => ({
      //     id: banner.id,
      //     name: banner.name,
      //     image: banner.image,
      //     url: banner.url,
      //     start_date: banner.start_date,
      //     end_date: banner.end_date,
      //     prioritas: banner.prioritas,
      //     status: banner.status,
      //   })),
      // };

      return outputParser.success(req, res, 'List Banner Success', queryResult);
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }
  static async getListBanner(req, res) {
    let queryResult = null;
    let { page, size: limit, search } = req.query;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    try {
      let where = { role: [ROLES.OPERATION, ROLES.SUPER_ADMIN], deleted_at: null };
      if (search) {
        Object.assign(where, {
          full_name: { [Op.iLike]: `%${search}%` },
        });
        // Object.assign(where, {
        //   [Op.or]: [
        //     {
        //       full_name: {
        //         [Op.iLike]: `%${search}%`,
        //       },
        //     }, = 10
        //     {
        //       email: {
        //         [Op.iLike]: `%${search}%`,
        //       },
        //     },
        //   ],
        // });
      }

      queryResult = await Banners.findAndCountAll({
        attributes: ['id', 'name', 'image', 'url', 'start_date', 'end_date', 'prioritas', 'status'],
        // // where,
        // limit,
        offset,
        order: [['prioritas', 'ASC']],
      });

      let template = {
        count: queryResult.count,
        rows: queryResult.rows.map((banner) => ({
          id: banner.id,
          name: banner.name,
          image: banner.image,
          url: banner.url,
          start_date: banner.start_date,
          end_date: banner.end_date,
          prioritas: banner.prioritas,
          status: banner.status,
        })),
      };

      paging.setData(template);
      const resp = paging.getPaginator();
      return outputParser.success(req, res, 'List Banner Success', resp);
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async getListCodeCompany(req, res) {
    let queryResult = null;

    try {
      queryResult = await Company.findAll({
        attributes: ['id', 'name_company', 'image', 'code_company'],
      });

      return outputParser.success(req, res, 'List Company Success', queryResult);
    } catch (err) {
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async createBanner(req, res) {
    const { name, image, url, start_date, end_date, prioritas } = req.body;
    const decode = req.payload;
    // let created_by = decode.full_name;
    // let updated_by = decode.full_name;

    try {
      const newBanner = await Banners.create({
        name,
        image,
        url,
        start_date,
        end_date,
        prioritas,
        // created_by,
        // updated_by,
      });

      let template = {
        id: newBanner.id,
        name: newBanner.name,
        image: newBanner.image,
        url: newBanner.url ? newBanner.url : '-',
        start_date: newBanner.start_date,
        end_date: newBanner.end_date,
        prioritas: newBanner.prioritas ? newBanner.prioritas : '-',
        created_at: newBanner.created_at,
        created_by: newBanner.created_by,
        // updated_by: newBanner.updated_by,
        // updated_at: newBanner.updated_at,
      };

      return outputParser.success(req, res, 'Berhasil menambahkan banner', template);
    } catch (err) {
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async editBanner(req, res) {
    const id = req.params.id; // Mengambil ID banner dari parameter URL
    const { name, image, url, start_date, end_date, prioritas } = req.body;
    // const decode = req.payload;
    // let updated_by = decode.full_name;

    try {
      // Mencari banner berdasarkan ID
      const banner = await Banners.findOne({
        where: { id },
      });

      // Jika banner tidak ditemukan
      if (!banner) {
        return outputParser.notFound(req, res, 'Banner not found');
      }

      // Melakukan pembaruan data banner
      banner.name = name || banner.name;
      banner.image = image || banner.image;
      banner.url = url || banner.url;
      banner.start_date = start_date || banner.start_date;
      banner.end_date = end_date || banner.end_date;
      banner.prioritas = prioritas || banner.prioritas;
      // banner.updated_by = updated_by || banner.updated_by;

      // Menyimpan perubahan ke database
      await banner.save();

      // Menyiapkan respons sukses
      let template = {
        id: banner.id,
        name: banner.name,
        image: banner.image,
        url: banner.url ? banner.url : '-',
        start_date: banner.start_date,
        end_date: banner.end_date,
        prioritas: banner.prioritas ? banner.prioritas : '-',
        // created_by: banner.created_by,
        // updated_by: banner.updated_by,
        updated_at: banner.updated_at,
      };

      return outputParser.success(req, res, 'Berhasil update banner', template);
    } catch (err) {
      // Jika terjadi kesalahan
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async getBannerById(req, res) {
    const id = req.params.id;

    try {
      const banner = await Banners.findOne({
        attributes: [
          'id',
          'name',
          'image',
          'url',
          'start_date',
          'end_date',
          'prioritas',
          'status',
          'created_by',
          'created_at',
          'updated_by',
          'updated_at',
        ],
        where: { id },
      });

      if (!banner) {
        return outputParser.notFound(req, res, 'Banner not found');
      }

      let template = {
        id: banner.id,
        name: banner.name,
        image: banner.image,
        url: banner.url ? banner.url : '-',
        start_date: banner.start_date,
        end_date: banner.end_date,
        prioritas: banner.prioritas ? banner.prioritas : '-',
        created_at: banner.created_at,
        created_by: banner.created_by,
        updated_by: banner.updated_by,
        updated_at: banner.updated_at,
      };
      return outputParser.success(req, res, 'Banner Details', template);
    } catch (err) {
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async deleteBanner(req, res) {
    const bannerId = req.params.id;

    try {
      const banner = await Banners.findByPk(bannerId);

      if (!banner) {
        return outputParser.notFound(req, res, 'Banner not found');
      }

      if (banner.status == 'ACTIVE') {
        return outputParser.badRequest(
          req,
          res,
          'Banner masih aktive, silahkan ubah status menjadi inative'
        );
      }

      banner.deleted_at = new Date();
      banner.save();

      return outputParser.success(req, res, 'Banner berhasil dihapus');
    } catch (err) {
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }
}

module.exports = {
  BannerController,
};

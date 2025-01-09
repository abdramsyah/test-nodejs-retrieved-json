const { cekToken } = require('../../../helpers/generalHelpers');
const { Banners, Companies, Company } = require('../../../models');
const { outputParser } = require('../../../utils/outputParser');
const { ROLES, STATUS } = require('../../../config/constant');
const Op = require('sequelize').Op;
const Paginator = require('../../../helpers/paginator');
const { Log } = require('../../../utils/customLog');
const { validationResult } = require('express-validator');
const { generateCompanyCode } = require('../../../utils/generatedCompany');
const axios = require('axios');

class CompanyController {
  static async retrieved(req, res) {
    let queryResult = null;
    let { page, size: limit, search } = req.query;
    page = page ?? 1;
    limit = limit ?? 10;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts', {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });

      const data = response.data.slice(offset, offset + limit);

      let template = {
        count: response.data.length,
        rows: data.map((item) => ({
          id: item.id,
          title: item.title,
        })),
      };

      paging.setData(template);
      const resp = paging.getPaginator();
      return outputParser.success(req, res, 'Retrieved Json Success', resp);
    } catch (err) {
      Log.error(err);
      return outputParser.error(req, res, 'Internal Server Error');
    }
  }

  static async createNewPartner(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        Log.error(errors);
        return outputParser.errorValidatorFirst(req, res, errors);
      }

      const { name, address, telp, handphone, email } = req.body;

      // let categoryName = category_name.replace(/(\b\w)/g, (match) => match.toUpperCase());

      // const existingUser = await Company.findOne({ where: { category_name } });
      // if (existingUser) {
      //   return outputParser.errorCustom(req, res, 'Email sudah terdaftar');
      // }
      // generateCompanyCode();

      await Company.create({
        name,
        address,
        code: generateCompanyCode(name),
        telp,
        handphone,
        email,
        status: 'ACTIVE',
      });

      return outputParser.success(req, res, 'Create Partner Success');
    } catch (err) {
      return outputParser.errorCustom(req, res, err.message, null);
    }
  }

  // 1. Data diambil dari endpoint https://jsonplaceholder.typicode.com/posts
  // 2. Dari endpoint tersebut hanya 2 field yang ditampilkan yaitu { Id, title }
  // 3. Terapkan dynamic pagination pada REST API
  // 4. Selanjutnya buat sebuah validasi untuk mengecek page dan page size yang akan ditampilkan.
  // 5. Terakhir buatlah sebuah custom Error Exception
}

module.exports = {
  CompanyController,
};

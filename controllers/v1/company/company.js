const { cekToken } = require('../../../helpers/generalHelpers');
const { Banners, Companies, Company } = require('../../../models');
const { outputParser } = require('../../../utils/outputParser');
const { ROLES, STATUS } = require('../../../config/constant');
const Op = require('sequelize').Op;
const Paginator = require('../../../helpers/paginator');
const { Log } = require('../../../utils/customLog');
const { validationResult } = require('express-validator');
const { generateCompanyCode } = require('../../../utils/generatedCompany');
const { axios } = require('axios').defaults;

class CompanyController {
  static async retrieved(req, res) {
    let queryResult = null;
    let { page, size: limit, search } = req.query;
    const paging = new Paginator(page, limit);
    const offset = paging.getOffset();

    try {
      // const api = axios.create({
      //   baseURL: 'https://jsonplaceholder.typicode.com/posts',
      //   headers: {
      //     'Content-Type': 'application/json; charset=UTF-8',
      //     'Cache-Control': 'no-cache',
      //     Pragma: 'no-cache',
      //     'X-Application-Name': 'app-name',
      //     'X-Application-Version': 1,
      //   },
      // });
      // let temp = api.get('');
      let temp = axios({
        method: 'get',
        url: 'https://jsonplaceholder.typicode.com/posts',
        responseType: 'stream',
      }).then(function (response) {
        response;
      });

      // let template = {
      //   count: queryResult.count,
      //   rows: queryResult.rows.map((company) => ({
      //     id: company.id,
      //     name: company.name,
      //   })),
      // };

      paging.setData(temp);
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

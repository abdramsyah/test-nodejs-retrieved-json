const _ = require('lodash');

function Paginator(page, pageSize) {
  this.currentPage = (!_.isNumber(page) ? Number(page) : page) || 1;
  this.pageSize = (!_.isNumber(pageSize) ? Number(pageSize) : pageSize) || 10;
  this.lastPage = 0;
  this.countAllData = 0;
  this.pages = null;
  this.data = [];
  return this;
}

Paginator.prototype.getLastPage = function () {
  this.lastPage = Math.ceil(this.countAllData / this.pageSize - 1 + 1);
  return this.lastPage;
};

Paginator.prototype.getPaginator = function () {
  this.getLastPage();
  if (!this.pages) {
    this.getPages();
  }
  return this;
};

Paginator.prototype.getCurrentPage = function () {
  return this.currentPage;
};

Paginator.prototype.getLimit = function () {
  return this.pageSize;
};

Paginator.prototype.getPages = function () {
  this.pages = [];

  const totalVisiblePages = this.currentPage < 5 ? 6 : 5; // Jumlah halaman yang ingin ditampilkan di sekitar halaman saat ini
  const halfVisiblePages = Math.floor(totalVisiblePages / 2);

  let startPage, endPage;

  if (this.lastPage <= totalVisiblePages) {
    // Jika jumlah halaman kurang dari atau sama dengan yang ingin ditampilkan
    startPage = 1;
    endPage = this.lastPage;
  } else if (this.currentPage <= halfVisiblePages) {
    // Jika currentPage berada di awal
    startPage = 1;
    endPage = totalVisiblePages;
  } else if (this.currentPage >= this.lastPage - halfVisiblePages) {
    // Jika currentPage berada di akhir
    startPage = this.lastPage - totalVisiblePages + 1;
    endPage = this.lastPage;
  } else {
    // Jika currentPage berada di tengah
    startPage = this.currentPage - halfVisiblePages;
    endPage = 0;
    if (this.currentPage < 5) {
      endPage = this.currentPage + halfVisiblePages - 1;
    } else {
      endPage = this.currentPage + halfVisiblePages;
    }

    // Jika currentPage adalah tepat setengah dari totalVisiblePages, tambahkan satu halaman setelahnya
    if (totalVisiblePages % 2 === 0 && this.currentPage % totalVisiblePages === 0) {
      endPage += 1;
    }
  }

  // Add "..." at the beginning if there are more pages before the visible pages
  if (startPage > 2) {
    this.pages.push('...');
  }

  for (let i = startPage; i <= endPage; i += 1) {
    this.pages.push(i);
  }

  // Add "..." at the end if there are more pages after the visible pages
  if (endPage < this.lastPage) {
    this.pages.push('...');
  }

  return this.pages;
};

Paginator.prototype.getOffset = function () {
  return (this.currentPage - 1) * this.pageSize;
};

Paginator.prototype.setData = function (data) {
  this.countAllData = Number(data.count);
  this.data = data.rows;
  return this;
};

module.exports = Paginator;

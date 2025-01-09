const generateCompanyCode = (companyName) => {
  const words = companyName.split(' ');
  let code = '';

  if (words.length === 1) {
    code = words[0].charAt(0) + 'AAA';
  } else if (words.length === 2) {
    words.forEach((word) => {
      code += word.charAt(0);
    });
    code += 'A';
  } else if (words.length >= 3) {
    for (let i = 0; i < 3; i++) {
      code += words[i].charAt(0);
    }
  }

  return code.toUpperCase();
};

module.exports = {
  generateCompanyCode,
};

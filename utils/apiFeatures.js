export default class ApiFeatures {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  search() {
    const key = this.queryParams.keyword
      ? {
          name: {
            $regex: this.queryParams.keyword,
            $options: 'i',
          },
        }
      : {};

    this.query = this.query.find({ ...key });
    return this;
  }

  filter() {
    const queryParamsCopy = { ...this.queryParams };

    //removing few fields for category
    const removeFields = ['keyword', 'page', 'limit'];

    //using forEach instead of map cause map returns array
    removeFields.forEach((x) => delete queryParamsCopy[x]);

    //filter for price and rating
    let queryParamsStr = JSON.stringify(queryParamsCopy);
    queryParamsStr = queryParamsStr.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    );

    this.query = this.query.find(JSON.parse(queryParamsStr));
    return this;
  }

  pagination(productsPerPage) {
    const currPage = Number(this.queryParams.page) || 1;

    const skipProducts = productsPerPage * (currPage - 1);

    this.query = this.query.limit(productsPerPage).skip(skipProducts);
    return this;
  }
}

const ObjectId = require('mongoose').Types.ObjectId

class APIFeatures {
  constructor(query, queryString) {
    
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields','searchKey','searchFields','populate'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  count(){
    this.query = this.query.count();
    return this
  }

  searchByKeyword() {
    if (this.queryString.searchKey && this.queryString.searchFields) {
      const fields = this.queryString.searchFields
      const keyword = this.queryString.searchKey
      const keyWordsSearchObj = fields.map(field => {
        if ((field === '_id' || field === 'companyId') && ObjectId.isValid(keyword)) {
          return { [field]: keyword }
        }
        else if (field !== '_id' && field !== 'companyId') {
          return {
            [field]: { $regex: keyword, $options: "i" } 
          }
        }

      }).filter(obj=>obj)

      this.query = this.query.find({
        $or: keyWordsSearchObj
      })
    }

    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    if(!this.queryString.page || !this.queryString.limit){
      return this
    }
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  populate () {
    if(this.queryString.populate){
      const fields = this.queryString.populate.split(',').join(' ');
      this.query = this.query.populate(fields)
    }
    return this
  }
}
module.exports = APIFeatures;

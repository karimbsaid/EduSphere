class APIFeatures {
  constructor(query, queryString, model = null) {
    this.query = query;
    this.queryString = queryString;
    this.model = model; // <-- nécessaire pour détecter les types
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Filtrage avancé
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // search() {
  //   if (this.queryString.search) {
  //     const searchRegex = new RegExp(this.queryString.search, "i");

  //     const searchQuery = {
  //       $or: [
  //         { title: searchRegex },
  //         { description: searchRegex },
  //         { category: searchRegex },
  //         { tags: { $in: [this.queryString.search] } }, // Recherche dans les tags (tableau)
  //       ],
  //     };

  //     this.query = this.query.find(searchQuery);
  //   }

  //   return this;
  // }

  search(searchableFields = []) {
    if (this.queryString.search) {
      const regex = new RegExp(this.queryString.search, "i");

      const orConditions = searchableFields.map((field) => {
        let isArrayField = false;

        // Vérifie dynamiquement si le champ est un tableau dans le modèle
        if (this.model) {
          const fieldType = this.model.schema.path(field)?.instance;
          isArrayField = fieldType === "Array";
        }

        if (isArrayField) {
          return { [field]: { $in: [regex] } };
        } else {
          return { [field]: { $regex: regex } };
        }
      });

      this.query = this.query.find({
        $and: [{ $or: orConditions }],
      });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

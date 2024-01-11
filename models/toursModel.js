const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '💥💥A tour must have a name💥💥'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        '💥💥A tour name must have less or equal than 40 characters💥💥'
      ],
      minlength: [
        10,
        '💥💥A tour name must have more or equal than 10 characters💥💥'
      ]
    },
    slug: String, //
    duration: {
      type: Number,
      required: [true, '💥💥A tour must have a duration💥💥']
    },
    maxGroupSize: {
      type: Number,
      required: [true, '💥💥A tour must have a maxGroupsSize💥💥']
    },
    difficulty: {
      type: String,
      required: [true, '💥💥A tour must have a difficulty💥💥'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: '💥💥 Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, '💥💥 Rating  must be above 1.0💥💥'],
      max: [5, '💥💥 Rating  must be below 5.0💥💥']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, '💥💥A tour must have a price💥💥']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // 'this' only points to current doc on NEW document ctration (this 直指向当前的文档，在我们创建新文档时)
        validator: function(value) {
          return value < this.price;
        },
        message: 'Discount price ({VALUE})should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, '💥💥A tour must have a summary💥💥']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, '💥💥A tour must have an imageCover']
    },
    image: [String],
    createAt: {
      type: Date,
      default: Date.now
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before  .save() and .create() | (运行在保存和创建前，但是对与更新无效)
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE 查询中间件
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATE MIDDLEWARE 聚合中间件
tourSchema.pre('aggregate', function(next) {
  // 对聚合函数处理，添加新的规则
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true }
    }
  });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

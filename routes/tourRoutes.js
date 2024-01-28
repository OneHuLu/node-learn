const express = require('express');
// controller for tours
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('andmin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:lating/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:lating/unit/:unit').get(tourController.getDistance);

router.route('/tour-detail/:tourId').get(tourController.tourDetailPage);

// Nested Routes
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-giude'),
    tourController.deleteTour
  );

module.exports = router;

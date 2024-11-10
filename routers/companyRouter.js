const express = require('express')
const { createCompany, getCompanyDetails, generateCompanyToken } = require('../controllers/companyController')
const { localhostOnly } = require('../controllers/utilController')

const router = express.Router();
router.route('/').post(localhostOnly, createCompany)
router.route('/generate-token').post(localhostOnly, generateCompanyToken)
router.route('/:id').get(getCompanyDetails)
module.exports = router
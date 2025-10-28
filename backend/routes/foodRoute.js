const express = require('express');
const {
    themThucPham,
    timKiemThucPham,
    suaThucPham,
    xoaThucPham,
    layChiTietThucPham
} = require('../controllers/foodController');

const router = express.Router();
router
    .route('/')
    .post(themThucPham)     
    .get(timKiemThucPham);  

router
    .route('/:id')
    .get(layChiTietThucPham)
    .put(suaThucPham)      
    .delete(xoaThucPham);   

module.exports = router;
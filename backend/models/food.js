
const mongoose = require('mongoose');
const FoodSchema = new mongoose.Schema({
    tenThucPham: {
        type: String,
        required: [true, 'Tên thực phẩm là bắt buộc'],
        trim: true,
        unique: true
    },
    giaThucPham: {
        type: Number,
        required: [true, 'Giá thực phẩm là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    donVi: {
        type: String,
        required: [true, 'Đơn vị là bắt buộc'],
        enum: ['kg', 'cái', 'lít', 'hộp', 'gói', 'phần'],
        default: 'cái'
    },
    danhMuc: {
        type: String,
        required: [true, 'Danh mục là bắt buộc'],
        enum: ['Thịt', 'Rau', 'Trái Cây', 'Ngũ Cốc', 'Đồ Uống', 'Khác'], 
        default: 'Khác'
    },
    ngayTao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Food', FoodSchema);
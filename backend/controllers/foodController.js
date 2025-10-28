const Food = require('../models/food');

exports.themThucPham = async (req, res) => {
    try {
        const food = await Food.create(req.body);
        res.status(201).json({
            success: true,
            data: food
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

exports.timKiemThucPham = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {

            query = {
                $or: [
                    { tenThucPham: { $regex: search, $options: 'i' } },
                    { danhMuc: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const foods = await Food.find(query).sort({ tenThucPham: 1 });

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};

exports.suaThucPham = async (req, res) => {
    try {
        const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy thực phẩm'
            });
        }

        res.status(200).json({
            success: true,
            data: food
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

exports.xoaThucPham = async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy thực phẩm'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Lỗi server'
        });
    }
};
exports.layChiTietThucPham = async (req, res) => {
    try {
        // Tìm kiếm một FoodItem theo ID từ tham số URL
        const food = await Food.findById(req.params.id); 

        if (!food) {
            // Nếu không tìm thấy, trả về 404
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy thực phẩm với ID này'
            });
        }

        // Nếu tìm thấy, trả về 200 OK
        res.status(200).json({
            success: true,
            data: food
        });
    } catch (err) {
        // Xử lý lỗi server hoặc lỗi định dạng ID
        res.status(500).json({
            success: false,
            error: 'Lỗi server hoặc ID không hợp lệ'
        });
    }
};
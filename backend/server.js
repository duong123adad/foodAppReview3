require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const foodRoutes = require('./routes/foodRoute');

app.use(express.json());
app.use(cors());
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Đã kết nối thành công với MongoDB');
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối MongoDB:', err.message);
        process.exit(1);
    });

app.use('/api/foods', foodRoutes);

app.use((req, res, next) => {
    res.status(404).json({ success: false, error: 'Không tìm thấy API route' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
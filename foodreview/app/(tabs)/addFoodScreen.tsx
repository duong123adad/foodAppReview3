import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

const API_BASE_URL = 'http://localhost:3000/api/foods';

const DON_VI_OPTIONS = ['kg', 'cái', 'lít', 'hộp', 'gói', 'phần'];
const DANH_MUC_OPTIONS = ['Thịt', 'Rau', 'Trái Cây', 'Ngũ Cốc', 'Đồ Uống', 'Khác'];

// -----------------------------------------------------------------

interface CustomSelectFieldProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: string[];
}

const CustomSelectField: React.FC<CustomSelectFieldProps> = ({ label, selectedValue, onValueChange, options }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selectInput}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectText}>
          {selectedValue}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#555"
          style={styles.selectIcon}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlaySelect}>
          <View style={styles.modalContentSelect}>
            <Text style={styles.modalHeaderSelect}>Chọn {label}</Text>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionItem}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedValue === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// -----------------------------------------------------------------

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isVisible) {
      timer = setTimeout(() => {
        onClose();
      }, 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <View style={styles.toastContainer}>
      <View style={styles.toastContent}>
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
};

// -----------------------------------------------------------------

const AddFoodScreen: React.FC = () => {
  const navigation = useNavigation();

  const [tenThucPham, setTenThucPham] = useState('');
  const [giaThucPham, setGiaThucPham] = useState('');
  const [donVi, setDonVi] = useState(DON_VI_OPTIONS[0]);
  const [danhMuc, setDanhMuc] = useState(DANH_MUC_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);


  const confirmAddFood = async () => {
    setIsAddModalVisible(false);
    setIsLoading(true);

    const giaParsed = parseFloat(giaThucPham.replace(/,/g, '.'));

    if (isNaN(giaParsed) || giaParsed <= 0) {
      setIsLoading(false);
      Alert.alert('Lỗi Dữ Liệu', 'Giá thực phẩm không hợp lệ. Vui lòng nhập số dương.');
      return;
    }

    try {
      const newFoodData = {
        tenThucPham: tenThucPham,
        giaThucPham: giaParsed,
        donVi: donVi,
        danhMuc: danhMuc,
      };

      const response = await axios.post(API_BASE_URL, newFoodData);

      if (response.data.success) {
        setIsSuccessToastVisible(true);

        setTenThucPham('');
        setGiaThucPham('');
        setDonVi(DON_VI_OPTIONS[0]);
        setDanhMuc(DANH_MUC_OPTIONS[0]);

        setTimeout(() => {
          (navigation as any).goBack();
        }, 1500);

      } else {
        Alert.alert('Lỗi API', response.data.error || 'Có lỗi xảy ra khi thêm sản phẩm.');
      }
    } catch (error: any) {
      console.error("Lỗi thêm thực phẩm:", error.response?.data || error.message);
      Alert.alert(
        'Lỗi Kết Nối',
        error.response?.data?.error || 'Không thể kết nối đến server hoặc dữ liệu không hợp lệ.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = () => {
    if (!tenThucPham.trim() || !giaThucPham.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Tên và Giá thực phẩm.');
      return;
    }

    const giaParsed = parseFloat(giaThucPham.replace(/,/g, '.'));
    if (isNaN(giaParsed) || giaParsed <= 0) {
      Alert.alert('Lỗi Dữ Liệu', 'Giá thực phẩm không hợp lệ. Vui lòng nhập số dương.');
      return;
    }

    setIsAddModalVisible(true);
  };

  const AddConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isAddModalVisible}
      onRequestClose={() => setIsAddModalVisible(false)}
    >
      <View style={styles.modalOverlayConfirm}>
        <View style={styles.modalContainerConfirm}>
          <Text style={styles.modalTitleConfirm}>Xác nhận Thêm</Text>
          <Text style={styles.modalMessageConfirm}>
            Bạn có chắc chắn muốn thêm sản phẩm **{tenThucPham}** với giá **{giaThucPham}** {donVi}?
          </Text>
          <View style={styles.modalButtonContainerConfirm}>
            <TouchableOpacity
              style={[styles.modalButtonConfirm, styles.modalCancelButtonConfirm]}
              onPress={() => setIsAddModalVisible(false)}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonTextConfirm}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButtonConfirm, styles.modalAddButtonConfirm]}
              onPress={confirmAddFood}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonTextConfirm}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );


  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Thêm Thực Phẩm Mới</Text>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={{ color: '#4CAF50', marginTop: 10 }}>Đang thêm sản phẩm...</Text>
          </View>
        )}

        <Text style={styles.label}>Tên thực phẩm (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Cá Hồi Nauy"
          placeholderTextColor="#999"
          value={tenThucPham}
          onChangeText={setTenThucPham}
          editable={!isLoading}
        />

        <Text style={styles.label}>Giá thực phẩm (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 350000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={giaThucPham}
          onChangeText={setGiaThucPham}
          editable={!isLoading}
        />

        <CustomSelectField
          label="Đơn vị"
          selectedValue={donVi}
          onValueChange={setDonVi}
          options={DON_VI_OPTIONS}
        />

        <CustomSelectField
          label="Danh mục"
          selectedValue={danhMuc}
          onValueChange={setDanhMuc}
          options={DANH_MUC_OPTIONS}
        />

        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.disabledButton]}
          onPress={handleAddFood}
          disabled={isLoading}
        >
          <Text style={styles.addButtonText}>
            {isLoading ? 'Đang thêm...' : 'Thêm thực phẩm'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
      <AddConfirmationModal />
      <SuccessToast
        message="Đã thêm sản phẩm thành công! 🎉"
        isVisible={isSuccessToastVisible}
        onClose={() => setIsSuccessToastVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    height: 50,
  },
  // =========================================================
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    height: 50,
    marginBottom: 10,
  },
  selectText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectIcon: {
    marginLeft: 8,
  },
  modalOverlaySelect: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentSelect: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.5,
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  modalHeaderSelect: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  closeButton: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // =========================================================
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  // =========================================================
  modalOverlayConfirm: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainerConfirm: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitleConfirm: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessageConfirm: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtonContainerConfirm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButtonConfirm: {
    backgroundColor: '#ccc',
  },
  modalAddButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  modalButtonTextConfirm: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // =========================================================
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  toastContent: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default AddFoodScreen;
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

type FoodRouteParams = {
  foodId: string;
};

const API_BASE_URL = 'http://localhost:3000/api/foods';

const DON_VI_OPTIONS = ['kg', 'cái', 'lít', 'hộp', 'gói', 'phần'];
const DANH_MUC_OPTIONS = ['Thịt', 'Rau', 'Trái Cây', 'Ngũ Cốc', 'Đồ Uống', 'Khác'];

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

const EditFoodScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: FoodRouteParams }, 'params'>>();

  const foodId = route.params?.foodId;

  const [tenThucPham, setTenThucPham] = useState('');
  const [giaThucPham, setGiaThucPham] = useState('');
  const [donVi, setDonVi] = useState(DON_VI_OPTIONS[0]);
  const [danhMuc, setDanhMuc] = useState(DANH_MUC_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);


  useEffect(() => {
    if (!foodId) {
      Alert.alert('Lỗi', 'Không có ID thực phẩm để chỉnh sửa. Đang quay lại...');
      (navigation as any).goBack();
      setIsLoading(false);
      return;
    }

    const fetchFoodDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${foodId}`);
        const data = response.data.data;

        setTenThucPham(data.tenThucPham || '');
        setGiaThucPham(data.giaThucPham?.toString() || '');

        setDonVi(DON_VI_OPTIONS.includes(data.donVi) ? data.donVi : DON_VI_OPTIONS[0]);
        setDanhMuc(DANH_MUC_OPTIONS.includes(data.danhMuc) ? data.danhMuc : DANH_MUC_OPTIONS[0]);

      } catch (error: any) {
        console.error("Lỗi lấy chi tiết thực phẩm:", error.response?.data || error.message);
        Alert.alert('Lỗi', 'Không thể tải chi tiết thực phẩm. Vui lòng kiểm tra API và ID.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodDetails();
  }, [foodId]);

  const confirmUpdateFood = async () => {
    setIsUpdateModalVisible(false);
    setIsSaving(true);

    try {
      const updatedData = {
        tenThucPham: tenThucPham,
        giaThucPham: parseFloat(giaThucPham),
        donVi: donVi,
        danhMuc: danhMuc,
      };

      const response = await axios.put(`${API_BASE_URL}/${foodId}`, updatedData);

      if (response.data.success) {
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm.');
        (navigation as any).goBack();
      } else {
        Alert.alert('Lỗi API', response.data.error || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật thực phẩm:", error.response?.data || error.message);
      Alert.alert(
        'Lỗi Kết Nối',
        error.response?.data?.error || 'Lỗi kết nối hoặc dữ liệu không hợp lệ.'
      );
    } finally {
      setIsSaving(false);
    }
  }


  const handleUpdateFood = async () => {
    if (!tenThucPham || !giaThucPham) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tên và Giá thực phẩm.');
      return;
    }

    setIsUpdateModalVisible(true);
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const UpdateConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isUpdateModalVisible}
      onRequestClose={() => setIsUpdateModalVisible(false)}
    >
      <View style={styles.modalOverlayConfirm}>
        <View style={styles.modalContainerConfirm}>
          <Text style={styles.modalTitleConfirm}>Xác nhận Cập nhật</Text>
          <Text style={styles.modalMessageConfirm}>Bạn có chắc chắn muốn lưu các thay đổi này?</Text>
          <View style={styles.modalButtonContainerConfirm}>
            <TouchableOpacity
              style={[styles.modalButtonConfirm, styles.modalCancelButtonConfirm]}
              onPress={() => setIsUpdateModalVisible(false)}
            >
              <Text style={styles.modalButtonTextConfirm}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButtonConfirm, styles.modalSaveButtonConfirm]}
              onPress={confirmUpdateFood}
              disabled={isSaving}
            >
              <Text style={styles.modalButtonTextConfirm}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );


  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Chỉnh Sửa Thông Tin Thực Phẩm</Text>

        <Text style={styles.label}>ID Sản Phẩm</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>{foodId}</Text>
        </View>

        <Text style={styles.label}>Tên thực phẩm (*)</Text>
        <TextInput
          style={styles.input}
          value={tenThucPham}
          onChangeText={setTenThucPham}
          placeholder="Tên sản phẩm"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Giá thực phẩm (*)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={giaThucPham}
          onChangeText={setGiaThucPham}
          placeholder="Giá sản phẩm"
          placeholderTextColor="#999"
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
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={handleUpdateFood}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <UpdateConfirmationModal />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    height: 50,
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
  },
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
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
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
  modalSaveButtonConfirm: {
    backgroundColor: '#007AFF',
  },
  modalButtonTextConfirm: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditFoodScreen;
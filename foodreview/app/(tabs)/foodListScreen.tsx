import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://localhost:3000/api/foods';

interface FoodItem {
  _id: string;
  tenThucPham: string;
  giaThucPham: number;
  donVi: string;
  danhMuc: string;
}

const formatCurrency = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'VND';
};

const ListFoodScreen: React.FC = () => {
  const navigation = useNavigation();
  const [foodList, setFoodList] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [foodToDeleteId, setFoodToDeleteId] = useState<string | null>(null);

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (error: any) {
      console.error("Lỗi tải danh sách:", error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tải danh sách thực phẩm từ server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFoodList();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchFoodList();
  };

  const confirmAndDeleteFood = async (id: string) => {
    setIsDeleteModalVisible(false);
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      if (response.data.success) {
        Alert.alert('Thành công', 'Đã xóa sản phẩm.');
        setFoodList(currentList => currentList.filter(item => item._id !== id));
      } else {
        Alert.alert('Lỗi', 'Không xóa được sản phẩm.');
      }
    } catch (error: any) {
      console.error("Lỗi xóa thực phẩm:", error.response?.data || error.message);
      Alert.alert('Lỗi', 'Lỗi kết nối hoặc không tìm thấy sản phẩm.');
    }
  };

  const handleDeleteFood = (id: string) => {
    setFoodToDeleteId(id);
    setIsDeleteModalVisible(true);
  };

  const handleNavigateToAddFood = () => {
    (navigation as any).navigate('AddFood');
  };

  const FoodListItem: React.FC<{ item: FoodItem }> = ({ item }) => (
    <View style={styles.listItemContainer}>
      <View style={styles.listItemDetails}>
        <Text style={styles.listItemName}>{item.tenThucPham}</Text>
        <Text style={styles.listItemPrice}>
          {formatCurrency(item.giaThucPham)}/{item.donVi}
        </Text>
      </View>
      <Text style={styles.listItemCategory}>{item.danhMuc}</Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => (navigation as any).navigate('EditFood', { foodId: item._id })}
      >
        <Text style={styles.editButtonText}>Sửa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteFood(item._id)}
      >
        <Text style={styles.deleteButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const DeleteConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isDeleteModalVisible}
      onRequestClose={() => setIsDeleteModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Xác nhận Xóa</Text>
          <Text style={styles.modalMessage}>Bạn có chắc chắn muốn xóa sản phẩm này?</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setIsDeleteModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalDeleteButton]}
              onPress={() => foodToDeleteId && confirmAndDeleteFood(foodToDeleteId)}
            >
              <Text style={styles.modalButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >

        <View style={styles.topActionContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleNavigateToAddFood}>
            <Text style={styles.addButtonText}>➕ Thêm thực phẩm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Danh sách sản phẩm ({foodList.length})</Text>

          {foodList.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có thực phẩm nào. Kéo xuống để tải lại hoặc thêm mới.</Text>
          ) : (
            foodList.map(item => (
              <FoodListItem key={item._id} item={item} />
            ))
          )}

          <View style={{ height: 50 }} />
        </View>

      </ScrollView>
      <DeleteConfirmationModal />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  topActionContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemDetails: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  listItemCategory: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
    width: 60,
    textAlign: 'right',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#ccc',
  },
  modalDeleteButton: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ListFoodScreen;
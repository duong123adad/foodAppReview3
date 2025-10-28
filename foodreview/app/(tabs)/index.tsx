import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AddFoodScreen from './addFoodScreen';
import EditFoodScreen from './editFoodScreen';
import ListFoodScreen from './foodListScreen';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <SafeAreaProvider>
      <Stack.Navigator
        initialRouteName="ListFood"
        screenOptions={{
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff', 
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="ListFood"
          component={ListFoodScreen}
          options={{ title: 'Quản Lý Thực Phẩm' }}
        />
        <Stack.Screen
          name="AddFood"
          component={AddFoodScreen}
          options={{ title: 'Thêm Thực Phẩm Mới' }}
        />
        <Stack.Screen
          name="EditFood"
          component={EditFoodScreen}
          options={{ title: 'Chỉnh Sửa Thực Phẩm' }}
        />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}
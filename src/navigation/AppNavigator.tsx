import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import type {
  FarmerTabParamList,
  MerchantTabParamList,
  MerchantStackParamList,
  DeliveryTabParamList,
  DeliveryStackParamList,
  AdminTabParamList,
  AdminStackParamList,
  HomeStackParamList,
  FarmerStackParamList,
} from "./types";

// Screens
import HomeScreen from "../screens/HomeScreen";
import FarmerDashboardScreen from "../screens/FarmerDashboardScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import FarmerProductsScreen from "../screens/FarmerProductsScreen";
import AddProductScreen from "../screens/AddProductScreen";
import MerchantOrdersScreen from "../screens/MerchantOrdersScreen";
import MerchantDashboardScreen from "../screens/MerchantDashboardScreen";
import DeliveryAssignmentsScreen from "../screens/DeliveryAssignmentsScreen";
import DeliveryDashboardScreen from "../screens/DeliveryDashboardScreen";
import NotAuthorizedScreen from "../screens/NotAuthorizedScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import TransactionHistoryScreen from "../screens/TransactionHistoryScreen";
import TransactionDetailScreen from "../screens/TransactionDetailScreen";

// ─── Nested Stacks ────────────────────────────────────────────────────────────

const HomeStack = createStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="ProductList"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product Detail" }}
      />
    </HomeStack.Navigator>
  );
}

const FarmerStack = createStackNavigator<FarmerStackParamList>();
function FarmerStackNavigator() {
  return (
    <FarmerStack.Navigator>
      <FarmerStack.Screen
        name="FarmerDashboard"
        component={FarmerDashboardScreen}
        options={{ headerShown: false }}
      />
      <FarmerStack.Screen
        name="FarmerProductsList"
        component={FarmerProductsScreen}
        options={{ title: "My Products" }}
      />
      <FarmerStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: "Add Product" }}
      />
      <FarmerStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <FarmerStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <FarmerStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </FarmerStack.Navigator>
  );
}

// ─── Role-Based Tab Navigators ────────────────────────────────────────────────

const FarmerTab = createBottomTabNavigator<FarmerTabParamList>();
function FarmerNavigator() {
  return (
    <FarmerTab.Navigator>
      <FarmerTab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{ title: "Marketplace", headerShown: false }}
      />
      <FarmerTab.Screen
        name="FarmerProductsStack"
        component={FarmerStackNavigator}
        options={{ title: "My Products", headerShown: false }}
      />
    </FarmerTab.Navigator>
  );
}

const MerchantStack = createStackNavigator<MerchantStackParamList>();
function MerchantStackNavigator() {
  return (
    <MerchantStack.Navigator>
      <MerchantStack.Screen
        name="MerchantDashboard"
        component={MerchantDashboardScreen}
        options={{ headerShown: false }}
      />
      <MerchantStack.Screen
        name="MerchantOrdersList"
        component={MerchantOrdersScreen}
        options={{ title: "My Orders" }}
      />
      <MerchantStack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{ title: "Transactions" }}
      />
      <MerchantStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: "Transaction Detail" }}
      />
      <MerchantStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <MerchantStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <MerchantStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </MerchantStack.Navigator>
  );
}

const MerchantTab = createBottomTabNavigator<MerchantTabParamList>();
function MerchantNavigator() {
  return (
    <MerchantTab.Navigator>
      <MerchantTab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{ title: "Marketplace", headerShown: false }}
      />
      <MerchantTab.Screen
        name="MerchantStack"
        component={MerchantStackNavigator}
        options={{ title: "My Orders", headerShown: false }}
      />
    </MerchantTab.Navigator>
  );
}

const DeliveryStack = createStackNavigator<DeliveryStackParamList>();
function DeliveryStackNavigator() {
  return (
    <DeliveryStack.Navigator>
      <DeliveryStack.Screen
        name="DeliveryDashboard"
        component={DeliveryDashboardScreen}
        options={{ headerShown: false }}
      />
      <DeliveryStack.Screen
        name="DeliveryAssignmentsList"
        component={DeliveryAssignmentsScreen}
        options={{ title: "My Assignments" }}
      />
      <DeliveryStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <DeliveryStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <DeliveryStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </DeliveryStack.Navigator>
  );
}

const DeliveryTab = createBottomTabNavigator<DeliveryTabParamList>();
function DeliveryNavigator() {
  return (
    <DeliveryTab.Navigator>
      <DeliveryTab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{ title: "Marketplace", headerShown: false }}
      />
      <DeliveryTab.Screen
        name="DeliveryStack"
        component={DeliveryStackNavigator}
        options={{ title: "Deliveries", headerShown: false }}
      />
    </DeliveryTab.Navigator>
  );
}

const AdminStack = createStackNavigator<AdminStackParamList>();
function AdminStackNavigator() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <AdminStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <AdminStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </AdminStack.Navigator>
  );
}

const AdminTab = createBottomTabNavigator<AdminTabParamList>();
function AdminNavigator() {
  return (
    <AdminTab.Navigator>
      <AdminTab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{ title: "Marketplace", headerShown: false }}
      />
      <AdminTab.Screen
        name="AdminStack"
        component={AdminStackNavigator}
        options={{ title: "Admin", headerShown: false }}
      />
    </AdminTab.Navigator>
  );
}

// ─── Root App Navigator ───────────────────────────────────────────────────────

export default function AppNavigator() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "FARMER") return <FarmerNavigator />;
  if (role === "MERCHANT") return <MerchantNavigator />;
  if (role === "DELIVERY") return <DeliveryNavigator />;
  if (role === "ADMIN" || role === "MANAGER" || role === "AGENT")
    return <AdminNavigator />;

  return <NotAuthorizedScreen />;
}

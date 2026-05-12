import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import NotificationBell from "../components/NotificationBell";
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
  AgentStackParamList,
} from "./types";

// Screens
import HomeScreen from "../screens/HomeScreen";
import FarmerDashboardScreen from "../screens/FarmerDashboardScreen";
import FarmerOrdersScreen from "../screens/FarmerOrdersScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import FarmerProductsScreen from "../screens/FarmerProductsScreen";
import AddProductScreen from "../screens/AddProductScreen";
import EditProductScreen from "../screens/EditProductScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import MerchantOrdersScreen from "../screens/MerchantOrdersScreen";
import MerchantDashboardScreen from "../screens/MerchantDashboardScreen";
import DeliveryAssignmentsScreen from "../screens/DeliveryAssignmentsScreen";
import DeliveryDashboardScreen from "../screens/DeliveryDashboardScreen";
import NotAuthorizedScreen from "../screens/NotAuthorizedScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";
import AdminProductsScreen from "../screens/AdminProductsScreen";
import AdminOrdersScreen from "../screens/AdminOrdersScreen";
import AdminDeliveriesScreen from "../screens/AdminDeliveriesScreen";
import AdminApprovalQueueScreen from "../screens/AdminApprovalQueueScreen";
import AdminDeliveryAssignScreen from "../screens/AdminDeliveryAssignScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import AIAgronomistScreen from "../screens/AIAgronomistScreen";
import TransactionHistoryScreen from "../screens/TransactionHistoryScreen";
import TransactionDetailScreen from "../screens/TransactionDetailScreen";
import SelectPaymentScreen from "../screens/payment/SelectPaymentScreen";
import PaymentProcessingScreen from "../screens/payment/PaymentProcessingScreen";
import PaymentResultScreen from "../screens/payment/PaymentResultScreen";
import BankTransferScreen from "../screens/payment/BankTransferScreen";
import ChatListScreen from "../screens/chat/ChatListScreen";
import ChatDetailScreen from "../screens/chat/ChatDetailScreen";
import AvailableOrdersScreen from "../screens/AvailableOrdersScreen";
import ScanQRScreen from "../screens/ScanQRScreen";
import DeliveryTrackingScreen from "../screens/DeliveryTrackingScreen";
import AgentOnboardingScreen from "../screens/AgentOnboardingScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SustainabilityScreen from "../screens/SustainabilityScreen";
import AboutScreen from "../screens/AboutScreen";
import AgentDashboardScreen from "../screens/AgentDashboardScreen";
import AgentRegionScreen from "../screens/AgentRegionScreen";
import AgentFarmersScreen from "../screens/AgentFarmersScreen";
import AdminReportsScreen from "../screens/AdminReportsScreen";

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
      <HomeStack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: "Analytics" }}
      />
      <HomeStack.Screen
        name="Sustainability"
        component={SustainabilityScreen}
        options={{ title: "Sustainability" }}
      />
      <HomeStack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "About" }}
      />
    </HomeStack.Navigator>
  );
}

const FarmerStack = createStackNavigator<FarmerStackParamList>();
function FarmerStackNavigator() {
  return (
    <FarmerStack.Navigator
      screenOptions={{ headerRight: () => <NotificationBell /> }}
    >
      <FarmerStack.Screen
        name="FarmerDashboard"
        component={FarmerDashboardScreen}
        options={{ headerShown: false }}
      />
      <FarmerStack.Screen
        name="FarmerOrders"
        component={FarmerOrdersScreen}
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
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: "Edit Product" }}
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
      <FarmerStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Messages" }}
      />
      <FarmerStack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }) => ({
          title: (route.params as any).participantName,
        })}
      />
      <FarmerStack.Screen
        name="AIAgronomist"
        component={AIAgronomistScreen}
        options={{ title: "AI Agronomist" }}
      />
    </FarmerStack.Navigator>
  );
}

// ─── Shared Chat Stack ────────────────────────────────────────────────────────
// Reused by all role navigators as the Chat tab

import { createStackNavigator as createChatStack } from "@react-navigation/stack";
import type { ChatStackParamList } from "../screens/chat/ChatListScreen";

const ChatStack = createChatStack<ChatStackParamList>();
function ChatStackNavigator() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Messages" }}
      />
      <ChatStack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }) => ({ title: route.params.participantName })}
      />
    </ChatStack.Navigator>
  );
}

// ─── Role-Based Tab Navigators ────────────────────────────────────────────────

const FarmerTab = createBottomTabNavigator<FarmerTabParamList>();
function FarmerNavigator() {
  return (
    <FarmerTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeStack: "storefront-outline",
            FarmerProductsStack: "leaf-outline",
            ChatStack: "chatbubble-ellipses-outline",
            AIAgronomist: "chatbox-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#1A7A35",
        tabBarInactiveTintColor: "#9E9E9E",
      })}
    >
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
      <FarmerTab.Screen
        name="ChatStack"
        component={ChatStackNavigator}
        options={{ title: "Messages", headerShown: false }}
      />
      <FarmerTab.Screen
        name="AIAgronomist"
        component={AIAgronomistScreen}
        options={{ title: "AI Agronomist", headerShown: false }}
      />
    </FarmerTab.Navigator>
  );
}

const MerchantStack = createStackNavigator<MerchantStackParamList>();
function MerchantStackNavigator() {
  return (
    <MerchantStack.Navigator
      screenOptions={{ headerRight: () => <NotificationBell /> }}
    >
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
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Order Detail" }}
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
        name="SelectPayment"
        component={SelectPaymentScreen}
        options={{ title: "Payment Method" }}
      />
      <MerchantStack.Screen
        name="PaymentProcessing"
        component={PaymentProcessingScreen}
        options={{
          title: "Processing Payment",
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <MerchantStack.Screen
        name="PaymentResult"
        component={PaymentResultScreen}
        options={{
          title: "Payment Result",
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <MerchantStack.Screen
        name="BankTransfer"
        component={BankTransferScreen}
        options={{ title: "Bank Transfer" }}
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
      <MerchantStack.Screen
        name="ScanQR"
        component={ScanQRScreen}
        options={{ title: "Scan QR" }}
      />
    </MerchantStack.Navigator>
  );
}

const MerchantTab = createBottomTabNavigator<MerchantTabParamList>();
function MerchantNavigator() {
  return (
    <MerchantTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeStack: "storefront-outline",
            MerchantStack: "bag-handle-outline",
            ChatStack: "chatbubble-ellipses-outline",
            ScanQR: "qr-code-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#1A7A35",
        tabBarInactiveTintColor: "#9E9E9E",
      })}
    >
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
      <MerchantTab.Screen
        name="ChatStack"
        component={ChatStackNavigator}
        options={{ title: "Messages", headerShown: false }}
      />
      <MerchantTab.Screen
        name="ScanQR"
        component={ScanQRScreen}
        options={{ title: "Scan QR", headerShown: false }}
      />
    </MerchantTab.Navigator>
  );
}

const DeliveryStack = createStackNavigator<DeliveryStackParamList>();
function DeliveryStackNavigator() {
  return (
    <DeliveryStack.Navigator
      screenOptions={{ headerRight: () => <NotificationBell /> }}
    >
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
        name="AvailableOrders"
        component={AvailableOrdersScreen}
        options={{ headerShown: false }}
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
      <DeliveryStack.Screen
        name="DeliveryTracking"
        component={DeliveryTrackingScreen}
        options={{ title: "Live Tracking" }}
      />
    </DeliveryStack.Navigator>
  );
}

const DeliveryTab = createBottomTabNavigator<DeliveryTabParamList>();
function DeliveryNavigator() {
  return (
    <DeliveryTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeStack: "storefront-outline",
            DeliveryStack: "bicycle-outline",
            ChatStack: "chatbubble-ellipses-outline",
            DeliveryTracking: "map-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#1A7A35",
        tabBarInactiveTintColor: "#9E9E9E",
      })}
    >
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
      <DeliveryTab.Screen
        name="ChatStack"
        component={ChatStackNavigator}
        options={{ title: "Messages", headerShown: false }}
      />
      <DeliveryTab.Screen
        name="DeliveryTracking"
        component={DeliveryTrackingScreen}
        options={{ title: "Live Tracking", headerShown: false }}
      />
    </DeliveryTab.Navigator>
  );
}

const AdminStack = createStackNavigator<AdminStackParamList>();
function AdminStackNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{ headerRight: () => <NotificationBell /> }}
    >
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: "Users" }}
      />
      <AdminStack.Screen
        name="AdminProducts"
        component={AdminProductsScreen}
        options={{ title: "Products" }}
      />
      <AdminStack.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ title: "Orders" }}
      />
      <AdminStack.Screen
        name="AdminDeliveries"
        component={AdminDeliveriesScreen}
        options={{ title: "Deliveries" }}
      />
      <AdminStack.Screen
        name="AdminApprovalQueue"
        component={AdminApprovalQueueScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="AdminDeliveryAssign"
        component={AdminDeliveryAssignScreen}
        options={{ title: "Delivery Assignment" }}
      />
      <AdminStack.Screen
        name="AgentOnboarding"
        component={AgentOnboardingScreen}
        options={{ title: "Agent Onboarding" }}
      />
      <AdminStack.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{ title: "Reports" }}
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
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeStack: "storefront-outline",
            AdminStack: "shield-checkmark-outline",
            ChatStack: "chatbubble-ellipses-outline",
          };
          return (
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#1A7A35",
        tabBarInactiveTintColor: "#9E9E9E",
      })}
    >
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
      <AdminTab.Screen
        name="ChatStack"
        component={ChatStackNavigator}
        options={{ title: "Messages", headerShown: false }}
      />
    </AdminTab.Navigator>
  );
}

// ─── Agent Stack ───────────────────────────────────────────────────────────────

const AgentStack = createStackNavigator<AgentStackParamList>();
function AgentStackNavigator() {
  return (
    <AgentStack.Navigator
      screenOptions={{ headerRight: () => <NotificationBell /> }}
    >
      <AgentStack.Screen
        name="AgentDashboard"
        component={AgentDashboardScreen}
        options={{ headerShown: false }}
      />
      <AgentStack.Screen
        name="AgentRegion"
        component={AgentRegionScreen}
        options={{ title: "Region Overview" }}
      />
      <AgentStack.Screen
        name="AgentFarmers"
        component={AgentFarmersScreen}
        options={{ title: "Farmers" }}
      />
      <AgentStack.Screen
        name="AgentOnboarding"
        component={AgentOnboardingScreen}
        options={{ title: "Onboarding" }}
      />
      <AgentStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Messages" }}
      />
      <AgentStack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }) => ({
          title: (route.params as any).participantName,
        })}
      />
      <AgentStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <AgentStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <AgentStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </AgentStack.Navigator>
  );
}

// ─── Root App Navigator ───────────────────────────────────────────────────────

export default function AppNavigator() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "FARMER") return <FarmerNavigator />;
  if (role === "MERCHANT") return <MerchantNavigator />;
  if (role === "DELIVERY") return <DeliveryNavigator />;
  if (role === "ADMIN" || role === "MANAGER")
    return <AdminNavigator />;
  if (role === "AGENT")
    return <AgentStackNavigator />;

  return <NotAuthorizedScreen />;
}

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
};

export type FarmerStackParamList = {
  FarmerDashboard: undefined;
  FarmerProductsList: undefined;
  AddProduct: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type FarmerTabParamList = {
  HomeStack: undefined;
  FarmerProductsStack: undefined;
};

export type MerchantStackParamList = {
  MerchantDashboard: undefined;
  MerchantOrdersList: undefined;
  TransactionHistory: undefined;
  TransactionDetail: { orderId: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type MerchantTabParamList = {
  HomeStack: undefined;
  MerchantStack: undefined;
};

export type DeliveryStackParamList = {
  DeliveryDashboard: undefined;
  DeliveryAssignmentsList: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type DeliveryTabParamList = {
  HomeStack: undefined;
  DeliveryStack: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminProducts: undefined;
  AdminOrders: undefined;
  AdminDeliveries: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type AdminTabParamList = {
  HomeStack: undefined;
  AdminStack: undefined;
};

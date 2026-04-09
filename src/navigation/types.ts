export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
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
};

export type FarmerTabParamList = {
  HomeStack: undefined;
  FarmerProductsStack: undefined;
};

export type MerchantStackParamList = {
  MerchantDashboard: undefined;
  MerchantOrdersList: undefined;
  Profile: undefined;
  Settings: undefined;
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
};

export type DeliveryTabParamList = {
  HomeStack: undefined;
  DeliveryStack: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type AdminTabParamList = {
  HomeStack: undefined;
  AdminStack: undefined;
};

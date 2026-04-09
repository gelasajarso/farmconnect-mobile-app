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
};

export type FarmerTabParamList = {
  HomeStack: undefined;
  FarmerProductsStack: undefined;
};

export type MerchantTabParamList = {
  HomeStack: undefined;
  MerchantOrders: undefined;
};

export type DeliveryTabParamList = {
  HomeStack: undefined;
  DeliveryAssignments: undefined;
};

export type AdminTabParamList = {
  HomeStack: undefined;
  AdminPlaceholder: undefined;
};

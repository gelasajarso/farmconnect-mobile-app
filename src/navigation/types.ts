import type { PaymentProvider, PaymentStatus, PaymentInitParams } from './payment';

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
  ChatList: undefined;
  ChatDetail: { conversationId: string; participantName: string; participantRole: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type FarmerTabParamList = {
  HomeStack: undefined;
  FarmerProductsStack: undefined;
  ChatStack: undefined;
};

export type MerchantStackParamList = {
  MerchantDashboard: undefined;
  MerchantOrdersList: undefined;
  TransactionHistory: undefined;
  TransactionDetail: { orderId: string };
  // ── Payment flow ──
  SelectPayment: { paymentParams: PaymentInitParams };
  PaymentProcessing: { provider: PaymentProvider; paymentParams: PaymentInitParams };
  PaymentResult: {
    status: PaymentStatus;
    provider: PaymentProvider;
    amount: number;
    order_id: string;
    reference: string | null;
    message: string;
  };
  BankTransfer: { paymentParams: PaymentInitParams };
  // ── Chat ──
  ChatList: undefined;
  ChatDetail: { conversationId: string; participantName: string; participantRole: string };
  // ─────────────────
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type MerchantTabParamList = {
  HomeStack: undefined;
  MerchantStack: undefined;
  ChatStack: undefined;
};

export type DeliveryStackParamList = {
  DeliveryDashboard: undefined;
  DeliveryAssignmentsList: undefined;
  ChatList: undefined;
  ChatDetail: { conversationId: string; participantName: string; participantRole: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type DeliveryTabParamList = {
  HomeStack: undefined;
  DeliveryStack: undefined;
  ChatStack: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminProducts: undefined;
  AdminOrders: undefined;
  AdminDeliveries: undefined;
  ChatList: undefined;
  ChatDetail: { conversationId: string; participantName: string; participantRole: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type AdminTabParamList = {
  HomeStack: undefined;
  AdminStack: undefined;
  ChatStack: undefined;
};

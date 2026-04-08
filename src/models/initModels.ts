import { Role } from "./Role";
import { User } from "./User";
import { Product } from "./Product";
import { Category } from "./Category";
import { Warehouse } from "./Warehouse";
import { Inventory } from "./Inventory";
import { Order } from "./Order";
import { OrderItem } from "./OrderItem";
import { Invoice } from "./Invoice";
import { Payment } from "./Payment";
import { Shipment } from "./Shipment";
import { Notification } from "./Notification";
import { Withdrawal } from "./Withdrawal";
import { WalletTransaction } from "./WalletTransaction";
import { Cart } from "./Cart";
import { CartItem } from "./CartItem";
import { Offer } from "./Offer";
import { Review } from "./Review";
import { ShippingZone } from "./ShippingZone";
import { Dispute } from "./Dispute";
import { KycDocument } from "./KycDocument";
import { CategoryCommission } from "./CategoryCommission";
import { AuditLog } from "./AuditLog";
import { TieredPrice } from "./TieredPrice";
import { FlashSale } from "./FlashSale";
import { Coupon } from "./Coupon";
import { Wishlist } from "./Wishlist";
import { FollowSupplier } from "./FollowSupplier";

export function initModels() {
  // users & roles
  User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
  Role.hasMany(User, { foreignKey: "role_id", as: "users" });

  // products & suppliers
  Product.belongsTo(User, { foreignKey: "supplier_id", as: "supplier" });
  User.hasMany(Product, { foreignKey: "supplier_id", as: "products" });

  // products & categories
  Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
  Category.hasMany(Product, { foreignKey: "category_id", as: "products" });

  // warehouses
  Warehouse.belongsTo(User, { foreignKey: "owner_id", as: "owner" });
  User.hasMany(Warehouse, { foreignKey: "owner_id", as: "warehouses" });

  // inventory
  Inventory.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  Product.hasMany(Inventory, { foreignKey: "product_id", as: "inventory" });
  Inventory.belongsTo(Warehouse, { foreignKey: "warehouse_id", as: "warehouse" });
  Warehouse.hasMany(Inventory, { foreignKey: "warehouse_id", as: "inventory" });

  // orders
  Order.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
  Order.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
  User.hasMany(Order, { foreignKey: "buyer_id", as: "buyerOrders" });
  User.hasMany(Order, { foreignKey: "seller_id", as: "sellerOrders" });

  // order items
  OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
  Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
  OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });

  // invoices
  Invoice.belongsTo(Order, { foreignKey: "order_id", as: "order" });
  Order.hasOne(Invoice, { foreignKey: "order_id", as: "invoice" });

  // payments
  Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
  Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });

  // shipments
  Shipment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
  Order.hasMany(Shipment, { foreignKey: "order_id", as: "shipments" });

  // notifications
  Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });

  // withdrawals
  Withdrawal.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(Withdrawal, { foreignKey: "user_id", as: "withdrawals" });

  // wallet transactions
  WalletTransaction.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(WalletTransaction, { foreignKey: "user_id", as: "walletTransactions" });

  // carts
  Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });

  // cart items
  CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });
  Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
  CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });

  // offers
  Offer.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  Product.hasMany(Offer, { foreignKey: "product_id", as: "offers" });
  Offer.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(Offer, { foreignKey: "user_id", as: "offers" });

  // reviews
  Review.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });
  User.hasMany(Review, { foreignKey: "reviewer_id", as: "reviews" });

  // ShippingZone has no associations (standalone lookup table)
  void ShippingZone;

  // disputes
  Dispute.belongsTo(User, { foreignKey: "opened_by", as: "opener" });
  Dispute.belongsTo(User, { foreignKey: "against_user", as: "target" });
  Dispute.belongsTo(User, { foreignKey: "resolved_by", as: "resolver" });
  Dispute.belongsTo(Order, { foreignKey: "order_id", as: "order" });
  User.hasMany(Dispute, { foreignKey: "opened_by", as: "openedDisputes" });

  // KYC documents
  KycDocument.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(KycDocument, { foreignKey: "user_id", as: "kycDocuments" });

  // category commissions
  CategoryCommission.belongsTo(Category, { foreignKey: "category_id", as: "category" });
  Category.hasOne(CategoryCommission, { foreignKey: "category_id", as: "commission" });

  // audit logs
  AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // tiered prices
  TieredPrice.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  Product.hasMany(TieredPrice, { foreignKey: "product_id", as: "tieredPrices" });

  // flash sales
  FlashSale.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  Product.hasMany(FlashSale, { foreignKey: "product_id", as: "flashSales" });
  FlashSale.belongsTo(User, { foreignKey: "created_by", as: "creator" });

  // coupons
  Coupon.belongsTo(User, { foreignKey: "created_by", as: "creator" });

  // wishlists
  Wishlist.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Wishlist.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  User.hasMany(Wishlist, { foreignKey: "user_id", as: "wishlists" });

  // follow suppliers
  FollowSupplier.belongsTo(User, { foreignKey: "follower_id", as: "follower" });
  FollowSupplier.belongsTo(User, { foreignKey: "supplier_id", as: "supplier" });
  User.hasMany(FollowSupplier, { foreignKey: "follower_id", as: "following" });
}


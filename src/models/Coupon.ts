import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface CouponAttributes {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  target_governorates: string | null;
  target_category_id: number | null;
  starts_at: Date;
  expires_at: Date;
  status: string;
  created_by: number;
  created_at: Date;
}

export type CouponCreationAttributes = Optional<
  CouponAttributes,
  "id" | "min_order_amount" | "max_uses" | "used_count" | "target_governorates" | "target_category_id" | "status" | "created_at"
>;

export class Coupon
  extends Model<CouponAttributes, CouponCreationAttributes>
  implements CouponAttributes {
  public id!: number;
  public code!: string;
  public discount_type!: string;
  public discount_value!: number;
  public min_order_amount!: number;
  public max_uses!: number;
  public used_count!: number;
  public target_governorates!: string | null;
  public target_category_id!: number | null;
  public starts_at!: Date;
  public expires_at!: Date;
  public status!: string;
  public created_by!: number;
  public created_at!: Date;
}

Coupon.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    discount_type: { type: DataTypes.STRING, allowNull: false },
    discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    min_order_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    max_uses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    used_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    target_governorates: { type: DataTypes.TEXT, allowNull: true },
    target_category_id: { type: DataTypes.INTEGER, allowNull: true },
    starts_at: { type: DataTypes.DATE, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "coupons", timestamps: false }
);

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface WishlistAttributes {
  id: number;
  user_id: number;
  product_id: number;
  desired_qty: number;
  created_at: Date;
}

export type WishlistCreationAttributes = Optional<WishlistAttributes, "id" | "desired_qty" | "created_at">;

export class Wishlist
  extends Model<WishlistAttributes, WishlistCreationAttributes>
  implements WishlistAttributes {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public desired_qty!: number;
  public created_at!: Date;
}

Wishlist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: {
      type: DataTypes.INTEGER, allowNull: false,
      references: { model: "products", key: "id" }
    },
    desired_qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "wishlists", timestamps: false }
);

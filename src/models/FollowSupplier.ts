import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface FollowSupplierAttributes {
  id: number;
  follower_id: number;
  supplier_id: number;
  created_at: Date;
}

export type FollowSupplierCreationAttributes = Optional<FollowSupplierAttributes, "id" | "created_at">;

export class FollowSupplier
  extends Model<FollowSupplierAttributes, FollowSupplierCreationAttributes>
  implements FollowSupplierAttributes {
  public id!: number;
  public follower_id!: number;
  public supplier_id!: number;
  public created_at!: Date;
}

FollowSupplier.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    follower_id: { type: DataTypes.INTEGER, allowNull: false },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "follow_suppliers",
    timestamps: false,
    indexes: [{ unique: true, fields: ["follower_id", "supplier_id"] }]
  }
);

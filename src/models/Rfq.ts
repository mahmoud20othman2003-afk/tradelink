import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface RfqAttributes {
  id: number;
  buyer_id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit: string;
  description: string | null;
  target_price: number | null;
  status: "open" | "quoted" | "accepted" | "rejected" | "expired";
  expires_at: Date | null;
  created_at: Date;
}

export type RfqCreationAttributes = Optional<
  RfqAttributes,
  "id" | "product_id" | "description" | "target_price" | "status" | "expires_at" | "created_at"
>;

export class Rfq
  extends Model<RfqAttributes, RfqCreationAttributes>
  implements RfqAttributes {
  public id!: number;
  public buyer_id!: number;
  public product_id!: number | null;
  public product_name!: string;
  public quantity!: number;
  public unit!: string;
  public description!: string | null;
  public target_price!: number | null;
  public status!: "open" | "quoted" | "accepted" | "rejected" | "expired";
  public expires_at!: Date | null;
  public created_at!: Date;
}

Rfq.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    product_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: "products", key: "id" } },
    product_name: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false, defaultValue: "piece" },
    description: { type: DataTypes.TEXT, allowNull: true },
    target_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "open" },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "rfqs", timestamps: false }
);

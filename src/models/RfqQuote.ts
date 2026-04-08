import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface RfqQuoteAttributes {
  id: number;
  rfq_id: number;
  supplier_id: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  valid_until: Date | null;
  status: "pending" | "accepted" | "rejected";
  created_at: Date;
}

export type RfqQuoteCreationAttributes = Optional<
  RfqQuoteAttributes,
  "id" | "notes" | "valid_until" | "status" | "created_at"
>;

export class RfqQuote
  extends Model<RfqQuoteAttributes, RfqQuoteCreationAttributes>
  implements RfqQuoteAttributes {
  public id!: number;
  public rfq_id!: number;
  public supplier_id!: number;
  public unit_price!: number;
  public total_price!: number;
  public notes!: string | null;
  public valid_until!: Date | null;
  public status!: "pending" | "accepted" | "rejected";
  public created_at!: Date;
}

RfqQuote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rfq_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "rfqs", key: "id" } },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    valid_until: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "rfq_quotes", timestamps: false }
);

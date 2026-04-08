import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface DisputeAttributes {
  id: number;
  order_id: number;
  opened_by: number;
  against_user: number;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  resolved_by: number | null;
  resolved_at: Date | null;
  created_at: Date;
}

export type DisputeCreationAttributes = Optional<
  DisputeAttributes,
  "id" | "description" | "status" | "resolution" | "resolved_by" | "resolved_at" | "created_at"
>;

export class Dispute
  extends Model<DisputeAttributes, DisputeCreationAttributes>
  implements DisputeAttributes {
  public id!: number;
  public order_id!: number;
  public opened_by!: number;
  public against_user!: number;
  public reason!: string;
  public description!: string | null;
  public status!: string;
  public resolution!: string | null;
  public resolved_by!: number | null;
  public resolved_at!: Date | null;
  public created_at!: Date;
}

Dispute.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    opened_by: { type: DataTypes.INTEGER, allowNull: false },
    against_user: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "open" },
    resolution: { type: DataTypes.TEXT, allowNull: true },
    resolved_by: { type: DataTypes.INTEGER, allowNull: true },
    resolved_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "disputes", timestamps: false }
);

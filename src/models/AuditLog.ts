import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface AuditLogAttributes {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: Date;
}

export type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  "id" | "user_id" | "entity_id" | "details" | "ip_address" | "created_at"
>;

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes {
  public id!: number;
  public user_id!: number | null;
  public action!: string;
  public entity_type!: string;
  public entity_id!: number | null;
  public details!: string | null;
  public ip_address!: string | null;
  public created_at!: Date;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    entity_type: { type: DataTypes.STRING, allowNull: false },
    entity_id: { type: DataTypes.INTEGER, allowNull: true },
    details: { type: DataTypes.TEXT, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "audit_logs", timestamps: false }
);

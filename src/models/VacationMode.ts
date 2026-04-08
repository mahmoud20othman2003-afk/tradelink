import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface VacationModeAttributes {
  id: number;
  supplier_id: number;
  is_active: boolean;
  message: string | null;
  auto_reply: string | null;
  starts_at: Date | null;
  ends_at: Date | null;
  created_at: Date;
}

export type VacationModeCreationAttributes = Optional<
  VacationModeAttributes,
  "id" | "is_active" | "message" | "auto_reply" | "starts_at" | "ends_at" | "created_at"
>;

export class VacationMode
  extends Model<VacationModeAttributes, VacationModeCreationAttributes>
  implements VacationModeAttributes {
  public id!: number;
  public supplier_id!: number;
  public is_active!: boolean;
  public message!: string | null;
  public auto_reply!: string | null;
  public starts_at!: Date | null;
  public ends_at!: Date | null;
  public created_at!: Date;
}

VacationMode.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: "users", key: "id" } },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    message: { type: DataTypes.STRING, allowNull: true },
    auto_reply: { type: DataTypes.STRING, allowNull: true },
    starts_at: { type: DataTypes.DATE, allowNull: true },
    ends_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "vacation_modes", timestamps: false }
);

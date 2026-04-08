import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface UnitConversionAttributes {
  id: number;
  from_unit: string;
  to_unit: string;
  factor: number;
  category: string | null;
}

export type UnitConversionCreationAttributes = Optional<UnitConversionAttributes, "id" | "category">;

export class UnitConversion
  extends Model<UnitConversionAttributes, UnitConversionCreationAttributes>
  implements UnitConversionAttributes {
  public id!: number;
  public from_unit!: string;
  public to_unit!: string;
  public factor!: number;
  public category!: string | null;
}

UnitConversion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    from_unit: { type: DataTypes.STRING, allowNull: false },
    to_unit: { type: DataTypes.STRING, allowNull: false },
    factor: { type: DataTypes.DECIMAL(15, 6), allowNull: false },
    category: { type: DataTypes.STRING, allowNull: true }
  },
  { sequelize, tableName: "unit_conversions", timestamps: false }
);

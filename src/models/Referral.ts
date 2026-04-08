import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface ReferralAttributes {
  id: number;
  referrer_id: number;
  referred_id: number;
  referral_code: string;
  reward_amount: number;
  status: "pending" | "completed" | "expired";
  completed_at: Date | null;
  created_at: Date;
}

export type ReferralCreationAttributes = Optional<
  ReferralAttributes,
  "id" | "reward_amount" | "status" | "completed_at" | "created_at"
>;

export class Referral
  extends Model<ReferralAttributes, ReferralCreationAttributes>
  implements ReferralAttributes {
  public id!: number;
  public referrer_id!: number;
  public referred_id!: number;
  public referral_code!: string;
  public reward_amount!: number;
  public status!: "pending" | "completed" | "expired";
  public completed_at!: Date | null;
  public created_at!: Date;
}

Referral.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    referrer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    referred_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
    referral_code: { type: DataTypes.STRING, allowNull: false },
    reward_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 50 },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "referrals", timestamps: false }
);

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface KycDocumentAttributes {
  id: number;
  user_id: number;
  document_type: string;
  document_number: string | null;
  file_path: string | null;
  status: string;
  reviewed_by: number | null;
  reviewed_at: Date | null;
  rejection_reason: string | null;
  created_at: Date;
}

export type KycDocumentCreationAttributes = Optional<
  KycDocumentAttributes,
  "id" | "document_number" | "file_path" | "status" | "reviewed_by" | "reviewed_at" | "rejection_reason" | "created_at"
>;

export class KycDocument
  extends Model<KycDocumentAttributes, KycDocumentCreationAttributes>
  implements KycDocumentAttributes {
  public id!: number;
  public user_id!: number;
  public document_type!: string;
  public document_number!: string | null;
  public file_path!: string | null;
  public status!: string;
  public reviewed_by!: number | null;
  public reviewed_at!: Date | null;
  public rejection_reason!: string | null;
  public created_at!: Date;
}

KycDocument.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    document_type: { type: DataTypes.STRING, allowNull: false },
    document_number: { type: DataTypes.STRING, allowNull: true },
    file_path: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    reviewed_by: { type: DataTypes.INTEGER, allowNull: true },
    reviewed_at: { type: DataTypes.DATE, allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { sequelize, tableName: "kyc_documents", timestamps: false }
);

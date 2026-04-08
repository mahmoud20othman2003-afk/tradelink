import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

export interface ReviewAttributes {
  id: number;
  reviewer_id: number;
  target_type: "supplier" | "product";
  target_id: number;
  rating: number;
  comment: string | null;
  created_at: Date;
}

export type ReviewCreationAttributes = Optional<
  ReviewAttributes,
  "id" | "comment" | "created_at"
>;

export class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes {
  public id!: number;
  public reviewer_id!: number;
  public target_type!: "supplier" | "product";
  public target_id!: number;
  public rating!: number;
  public comment!: string | null;
  public created_at!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    target_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["supplier", "product"]]
      }
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "reviews",
    timestamps: false
  }
);

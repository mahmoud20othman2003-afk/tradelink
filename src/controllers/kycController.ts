import { Request, Response, NextFunction } from "express";
import { KycDocument } from "../models/KycDocument";
import { User } from "../models/User";

export async function submitKycDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const { document_type, document_number, file_path } = req.body;

    if (!document_type) {
      return res.status(400).json({ success: false, error: "document_type is required" });
    }

    const validTypes = ["commercial_register", "tax_card", "national_id", "import_license"];
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: `document_type must be one of: ${validTypes.join(", ")}`
      });
    }

    // Check if same type already submitted and pending
    const existing = await KycDocument.findOne({
      where: { user_id: userId, document_type, status: "pending" }
    });
    if (existing) {
      return res.status(409).json({ success: false, error: "لديك مستند من نفس النوع قيد المراجعة" });
    }

    const doc = await KycDocument.create({
      user_id: userId,
      document_type,
      document_number: document_number || null,
      file_path: file_path || null
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
}

export async function getMyKycDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const docs = await KycDocument.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
}

export async function listPendingKyc(_req: Request, res: Response, next: NextFunction) {
  try {
    const docs = await KycDocument.findAll({
      where: { status: "pending" },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email", "company_name"] }],
      order: [["created_at", "ASC"]]
    });
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
}

export async function reviewKycDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = (req as any).userId;
    const { status, rejection_reason } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "status must be 'approved' or 'rejected'" });
    }

    const doc = await KycDocument.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: "KYC document not found" });
    if (doc.status !== "pending") {
      return res.status(400).json({ success: false, error: "هذا المستند تمت مراجعته بالفعل" });
    }

    await doc.update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date(),
      rejection_reason: status === "rejected" ? (rejection_reason || "No reason given") : null
    });

    res.json({ success: true, message: status === "approved" ? "تم قبول المستند" : "تم رفض المستند", data: doc });
  } catch (err) { next(err); }
}

export async function getKycStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { user_id } = req.params;
    const docs = await KycDocument.findAll({
      where: { user_id: Number(user_id) },
      order: [["created_at", "DESC"]]
    });

    const allApproved = docs.length > 0 && docs.every(d => d.status === "approved");
    const hasPending = docs.some(d => d.status === "pending");
    const hasRejected = docs.some(d => d.status === "rejected");

    let verificationStatus = "unverified";
    if (allApproved) verificationStatus = "verified";
    else if (hasPending) verificationStatus = "pending";
    else if (hasRejected) verificationStatus = "requires_action";

    res.json({
      success: true,
      data: {
        user_id: Number(user_id),
        verification_status: verificationStatus,
        documents: docs
      }
    });
  } catch (err) { next(err); }
}

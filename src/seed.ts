import bcrypt from "bcryptjs";
import { sequelize } from "./models";
import { Role } from "./models/Role";
import { User } from "./models/User";
import { Product } from "./models/Product";
import { Category } from "./models/Category";
import { Warehouse } from "./models/Warehouse";
import { Inventory } from "./models/Inventory";
import { Order } from "./models/Order";
import { OrderItem } from "./models/OrderItem";
import { Invoice } from "./models/Invoice";
import { Payment } from "./models/Payment";
import { Shipment } from "./models/Shipment";
import { Notification } from "./models/Notification";
import { Withdrawal } from "./models/Withdrawal";
import { Review } from "./models/Review";
import { ShippingZone } from "./models/ShippingZone";
import { Dispute } from "./models/Dispute";
import { KycDocument } from "./models/KycDocument";
import { CategoryCommission } from "./models/CategoryCommission";
import { AuditLog } from "./models/AuditLog";
import { TieredPrice } from "./models/TieredPrice";
import { FlashSale } from "./models/FlashSale";
import { Coupon } from "./models/Coupon";
import { Wishlist } from "./models/Wishlist";
import { FollowSupplier } from "./models/FollowSupplier";
import { Rfq } from "./models/Rfq";
import { RfqQuote } from "./models/RfqQuote";
import { ProductBundle } from "./models/ProductBundle";
import { BundleItem } from "./models/BundleItem";
import { PreOrder } from "./models/PreOrder";
import { SampleRequest } from "./models/SampleRequest";
import { SupplierMov } from "./models/SupplierMov";
import { TaxConfig } from "./models/TaxConfig";
import { UnitConversion } from "./models/UnitConversion";
import { LotTracking } from "./models/LotTracking";
import { SubscriptionPlan } from "./models/SubscriptionPlan";
import { LoyaltyPoint } from "./models/LoyaltyPoint";
import { Referral } from "./models/Referral";
import { Badge } from "./models/Badge";
import { UserBadge } from "./models/UserBadge";
import { Rma } from "./models/Rma";
import { BackOrder } from "./models/BackOrder";
import { VacationMode } from "./models/VacationMode";
import { initModels } from "./models/initModels";

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        initModels();
        await sequelize.sync({ force: true });
        console.log("Database synced (forced).");

        // ── Roles ──
        const roles = await Role.bulkCreate([
            { name: "Supplier" },
            { name: "Wholesaler" },
            { name: "Retailer" },
            { name: "Customer" },
            { name: "Admin" }
        ]);
        console.log("Roles seeded.");

        const supplierRole = roles.find(r => r.name === "Supplier")!;
        const wholesalerRole = roles.find(r => r.name === "Wholesaler")!;
        const customerRole = roles.find(r => r.name === "Customer")!;

        // ── Users ──
        const hashedPass = await bcrypt.hash("password123", 10);

        const subExpiry = new Date();
        subExpiry.setMonth(subExpiry.getMonth() + 1);
        const expiredDate = new Date();
        expiredDate.setMonth(expiredDate.getMonth() - 1);

        const supplier = await User.create({
            name: "Super Supplier Ltd.",
            email: "supplier@tradelink.com",
            password: hashedPass,
            role_id: supplierRole.id,
            company_name: "Super Supplier Ltd.",
            location: "Cairo",
            balance: 1000.0,
            status: "active",
            subscription_status: "active",
            subscription_date: new Date(),
            subscription_expiry: subExpiry,
            instapay_address: "super_supplier@instapay",
            vodafone_cash_number: "01012345678"
        });

        const wholesaler = await User.create({
            name: "Cairo Wholesale Co.",
            email: "wholesale@tradelink.com",
            password: hashedPass,
            role_id: wholesalerRole.id,
            company_name: "Cairo Wholesale Co.",
            location: "Alexandria",
            balance: 500.0,
            status: "active",
            subscription_status: "active",
            subscription_date: new Date(),
            subscription_expiry: subExpiry,
            instapay_address: "cairo_wholesale@instapay",
            vodafone_cash_number: "01288887777"
        });

        const retailerRole = roles.find(r => r.name === "Retailer")!;
        const retailer = await User.create({
            name: "Giza Retail Shop",
            email: "retail@tradelink.com",
            password: hashedPass,
            role_id: retailerRole.id,
            company_name: "Giza Retail Shop",
            location: "Giza",
            balance: 200.0,
            status: "active",
            subscription_status: "active",
            subscription_date: new Date(),
            subscription_expiry: subExpiry
        });

        const customer = await User.create({
            name: "Ahmed Mohamed",
            email: "ahmed@consumer.com",
            password: hashedPass,
            role_id: customerRole.id,
            company_name: "Ahmed's Shop",
            status: "active"
        });

        const adminRole = roles.find(r => r.name === "Admin")!;
        const admin = await User.create({
            name: "System Admin",
            email: "admin@tradelink.com",
            password: hashedPass,
            role_id: adminRole.id,
            company_name: "TradeLink HQ",
            location: "Cairo",
            balance: 5000.0,
            status: "active"
        });
        console.log("Users seeded.");

        // ── Categories ──
        const categories = await Category.bulkCreate([
            { name: "Food & Grains", description: "Food products, rice, wheat, oils" },
            { name: "Oils & Fats", description: "Cooking oils, ghee, and fats" },
            { name: "Beverages", description: "Water, juices, and soft drinks" },
            { name: "Personal Care", description: "Shampoo, soap, and cosmetics" },
            { name: "Cleaning Supplies", description: "Detergents and house cleaning tools" },
            { name: "Electronics", description: "Mobiles, computers, and home appliances" },
            { name: "Clothing & Fashion", description: "Clothes, shoes, and accessories" },
            { name: "Construction Materials", description: "Cement, steel, and building tools" },
            { name: "Home & Furniture", description: "Furniture, kitchenware, and decor" },
            { name: "Auto Parts", description: "Car parts and accessories" },
            { name: "Medical Supplies", description: "Medicines and health equipment" },
            { name: "Industrial Equipment", description: "Machines and factory tools" },
            { name: "Plastics & Packaging", description: "Plastic products and packing materials" },
            { name: "Agriculture", description: "Seeds, fertilizers, and farm tools" },
            { name: "Textiles", description: "Fabrics and threads" }
        ]);
        console.log("Categories seeded.");

        const products = await Product.bulkCreate([
            {
                name: "Premium Egyptian Rice", sku: "RICE-001", price: 25.0, wholesale_price: 20.0, min_order_qty: 10,
                supplier_id: supplier.id, category_id: categories[0].id, quantity: 500, status: "active",
                image: "assets/product_rice.png",
                ai_description: "تم تحليل جودة هذا الأرز بواسطة الذكاء الاصطناعي: نسبة كسر أقل من 2%، نقاوة عالية، ومثالي للتخزين الطويل."
            },
            {
                name: "Refined Sunflower Oil", sku: "OIL-002", price: 45.0, wholesale_price: 38.0, min_order_qty: 5,
                supplier_id: supplier.id, category_id: categories[1].id, quantity: 200, status: "active",
                image: "assets/product_oil.png",
                ai_description: "خوارزمية الذكاء الاصطناعي تؤكد: زيت نقي 100%، غني بفيتامين E، ونقطة غليان مرتفعة للطهي الصحي."
            },
            {
                name: "Smart Phone X1", sku: "ELEC-001", price: 8500.0, wholesale_price: 7800.0, min_order_qty: 2,
                supplier_id: supplier.id, category_id: categories[5].id, quantity: 50, status: "active",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
                ai_description: "تقييم الذكاء الاصطناعي: أداء فائق في تشغيل التطبيقات الثقيلة، بطارية تدوم طويلاً، وشاشة فائقة الوضوح."
            },
            {
                name: "Cotton T-Shirt (Pack of 5)", sku: "CLOT-001", price: 450.0, wholesale_price: 350.0, min_order_qty: 10,
                supplier_id: supplier.id, category_id: categories[6].id, quantity: 150, status: "active",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
                ai_description: "توصية ذكية: نسيج قطني 100% مقاوم للانكماش، ألوان ثابتة بعد الغسيل، وتصميم مريح للارتداء اليومي."
            },
            {
                name: "Portland Cement (50kg)", sku: "CONS-001", price: 180.0, wholesale_price: 165.0, min_order_qty: 20,
                supplier_id: supplier.id, category_id: categories[7].id, quantity: 1000, status: "active",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
                ai_description: "تحليل إنشائي (AI): درجة تماسك عالية، زمن شك قياسي، ومطابق لأعلى المواصفات العالمية للبناء."
            },
            {
                name: "Modern Sofa Set", sku: "HOME-001", price: 12000.0, wholesale_price: 10500.0, min_order_qty: 1,
                supplier_id: supplier.id, category_id: categories[8].id, quantity: 10, status: "active",
                image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60",
                ai_description: "رؤية التصميم الذكي: هيكل خشبي متين، أقمشة سهلة التنظيف، وتصميم مريح يوفر أقصى درجات الدعم للظهر."
            },
            {
                name: "Brake Pads Set", sku: "AUTO-001", price: 650.0, wholesale_price: 550.0, min_order_qty: 5,
                supplier_id: supplier.id, category_id: categories[9].id, quantity: 80, status: "active",
                image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop&q=60",
                ai_description: "فحص الجودة الذكي: مادة احتكاك عالية الأداء، هدوء تام عند المكابح، وعمر افتراضي طويل للسلامة."
            },
            {
                name: "Medical Face Masks (Box 50)", sku: "MED-001", price: 75.0, wholesale_price: 55.0, min_order_qty: 20,
                supplier_id: supplier.id, category_id: categories[10].id, quantity: 2000, status: "active",
                image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60",
                ai_description: "تحليل الكفاءة الحيوية: 3 طبقات حماية عالية الترشيح، جسر أنف قابل للتعديل، وأربطة مريحة للأذن."
            },
            {
                name: "Organic NPK Fertilizer (25kg)", sku: "AGRI-001", price: 320.0, wholesale_price: 280.0, min_order_qty: 10,
                supplier_id: supplier.id, category_id: categories[13].id, quantity: 300, status: "active",
                image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60",
                ai_description: "توصية زراعية ذكية: تركيبة متوازنة للنمو السريع، غني بالعناصر الصغرى، وآمن تماماً للتربة والمحاصيل."
            },
            {
                name: "Silk Thread (Bulk Roll)", sku: "TEX-001", price: 150.0, wholesale_price: 120.0, min_order_qty: 5,
                supplier_id: supplier.id, category_id: categories[14].id, quantity: 100, status: "active",
                image: "https://images.unsplash.com/photo-1520004434532-668416a08753?w=500&auto=format&fit=crop&q=60",
                ai_description: "تحليل النسيج (AI): قوة شد عالية، لمعان طبيعي يدوم، ومثالي لماكينات التطريز والنسيج الحديثة."
            },
            {
                name: "Basmati Rice 5kg", sku: "BR-001", price: 150.0, wholesale_price: 130.0, min_order_qty: 5,
                supplier_id: wholesaler.id, category_id: categories[0].id, quantity: 200, status: "active",
                image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
                ai_description: "أرز بسمتي فاخر تم استيراده وفحصه ذكياً لضمان طول الحبة ورائحتها العطرية الفواحة."
            },
            {
                name: "Wholesale Flour 25kg", sku: "WF-001", price: 300.0, wholesale_price: 270.0, min_order_qty: 10,
                supplier_id: wholesaler.id, category_id: categories[0].id, quantity: 150, status: "active",
                image: "https://images.unsplash.com/photo-1627485601819-74cefd5f1eb5?w=500&auto=format&fit=crop&q=60",
                ai_description: "دقيق استخراج 72% مثالي للمخابز والحلويات، مدعم بالفيتامينات ومحلل آلياً لضمان الجودة."
            },
            {
                name: "Sugar Wholesale Pack", sku: "SW-001", price: 200.0, wholesale_price: 180.0, min_order_qty: 5,
                supplier_id: wholesaler.id, category_id: categories[0].id, quantity: 300, status: "active",
                image: "https://images.unsplash.com/photo-1581447100595-3773ca02c34a?w=500&auto=format&fit=crop&q=60",
                ai_description: "سكر أبيض نقي مكرر، حبيبات متساوية، معبأ آلياً تحت رقابة صحية صارمة."
            }
        ]);
        console.log("Products seeded.");

        // ── Warehouse ──
        const warehouse = await Warehouse.create({
            owner_id: supplier.id,
            city: "Cairo",
            address: "10th of Ramadan Industrial Zone, Block A7",
            capacity: 5000
        });
        console.log("Warehouse seeded.");

        // ── Inventory ──
        await Inventory.bulkCreate([
            { product_id: products[0].id, warehouse_id: warehouse.id, quantity: 500 },
            { product_id: products[1].id, warehouse_id: warehouse.id, quantity: 200 },
            { product_id: products[2].id, warehouse_id: warehouse.id, quantity: 300 },
            { product_id: products[3].id, warehouse_id: warehouse.id, quantity: 100 },
            { product_id: products[4].id, warehouse_id: warehouse.id, quantity: 1000 }
        ]);
        console.log("Inventory seeded.");

        // ── Orders ──
        const order1 = await Order.create({
            buyer_id: customer.id,
            seller_id: supplier.id,
            total_amount: 475.0,
            status: "delivered"
        });

        const order2 = await Order.create({
            buyer_id: wholesaler.id,
            seller_id: supplier.id,
            total_amount: 1250.0,
            status: "processing"
        });

        const order3 = await Order.create({
            buyer_id: customer.id,
            seller_id: supplier.id,
            total_amount: 250.0,
            status: "pending"
        });

        // ── Order Items ──
        await OrderItem.bulkCreate([
            { order_id: order1.id, product_id: products[0].id, quantity: 10, unit_price: 25.0 },
            { order_id: order1.id, product_id: products[1].id, quantity: 5, unit_price: 45.0 },
            { order_id: order2.id, product_id: products[0].id, quantity: 50, unit_price: 25.0 },
            { order_id: order3.id, product_id: products[0].id, quantity: 10, unit_price: 25.0 }
        ]);
        console.log("Orders & Items seeded.");

        // ── Invoices ──
        await Invoice.bulkCreate([
            { order_id: order1.id, invoice_number: "INV-2024-001", amount: 475.0, status: "paid" },
            { order_id: order2.id, invoice_number: "INV-2024-002", amount: 1250.0, status: "unpaid" },
            { order_id: order3.id, invoice_number: "INV-2024-003", amount: 250.0, status: "unpaid" }
        ]);
        console.log("Invoices seeded.");

        // ── Payments ──
        await Payment.bulkCreate([
            { order_id: order1.id, method: "bank_transfer", amount: 475.0, status: "completed", transaction_ref: "TXN-BT-001" },
            { order_id: order2.id, method: "instapay", amount: 500.0, status: "completed", transaction_ref: "TXN-IP-002" }
        ]);
        console.log("Payments seeded.");

        // ── Shipments ──
        await Shipment.bulkCreate([
            { order_id: order1.id, company: "Aramex Egypt", tracking_number: "ARX-EG-20240001", status: "delivered", delivered_at: new Date() },
            { order_id: order2.id, company: "DHL Egypt", tracking_number: "DHL-EG-20240002", status: "in_transit" }
        ]);
        console.log("Shipments seeded.");

        // ── Notifications ──
        await Notification.bulkCreate([
            { user_id: supplier.id, title: "New Order Received", message: "You received a new order #3 from Ahmed Mohamed", type: "info" },
            { user_id: supplier.id, title: "Payment Confirmed", message: "Payment of EGP 475 for order #1 has been confirmed", type: "success" },
            { user_id: customer.id, title: "Order Delivered", message: "Your order #1 has been delivered successfully", type: "success" },
            { user_id: customer.id, title: "New Products Available", message: "Check out new products from Super Supplier Ltd.", type: "info" },
            { user_id: wholesaler.id, title: "Shipment Update", message: "Your order #2 is now in transit via DHL", type: "info" }
        ]);
        console.log("Notifications seeded.");

        // ── Withdrawals ──
        await Withdrawal.bulkCreate([
            { user_id: supplier.id, amount: 200.0, method: "bank_transfer", status: "completed", transaction_ref: "WD-BNK-SEED001" },
            { user_id: supplier.id, amount: 100.0, method: "instapay", status: "pending", transaction_ref: "WD-INS-SEED002" },
            { user_id: wholesaler.id, amount: 50.0, method: "vodafone_cash", status: "pending", transaction_ref: "WD-VOD-SEED003" }
        ]);
        console.log("Withdrawals seeded.");

        // ── Reviews ──
        await Review.bulkCreate([
            { reviewer_id: customer.id, target_type: "supplier", target_id: supplier.id, rating: 5, comment: "مورد ممتاز، منتجات عالية الجودة وتسليم سريع" },
            { reviewer_id: wholesaler.id, target_type: "supplier", target_id: supplier.id, rating: 4, comment: "تعامل جيد وأسعار تنافسية" },
            { reviewer_id: retailer.id, target_type: "supplier", target_id: supplier.id, rating: 5, comment: "أفضل مورد تعاملت معه" },
            { reviewer_id: customer.id, target_type: "product", target_id: products[0].id, rating: 5, comment: "أرز ممتاز وطعم رائع" },
            { reviewer_id: wholesaler.id, target_type: "product", target_id: products[0].id, rating: 4, comment: "جودة عالية ومناسب للبيع بالتجزئة" },
            { reviewer_id: retailer.id, target_type: "product", target_id: products[1].id, rating: 4, comment: "زيت نقي وسعر مناسب" },
            { reviewer_id: customer.id, target_type: "product", target_id: products[2].id, rating: 5, comment: "موبايل رائع وأداء ممتاز" },
            { reviewer_id: retailer.id, target_type: "product", target_id: products[3].id, rating: 3, comment: "جودة متوسطة ولكن السعر مناسب" },
            { reviewer_id: customer.id, target_type: "supplier", target_id: wholesaler.id, rating: 4, comment: "تاجر جملة موثوق وأسعار جيدة" },
            { reviewer_id: retailer.id, target_type: "supplier", target_id: wholesaler.id, rating: 5, comment: "سرعة في التسليم وتنوع في المنتجات" }
        ]);
        console.log("Reviews seeded.");

        // ── Shipping Zones ──
        await ShippingZone.bulkCreate([
            {
                zone_name: "القاهرة الكبرى",
                governorates: "القاهرة,الجيزة,القليوبية",
                base_cost: 25, cost_per_kg: 3,
                estimated_days_min: 1, estimated_days_max: 2
            },
            {
                zone_name: "الدلتا",
                governorates: "الإسكندرية,الغربية,الدقهلية,المنوفية,الشرقية,البحيرة,كفر الشيخ,دمياط",
                base_cost: 35, cost_per_kg: 4,
                estimated_days_min: 2, estimated_days_max: 3
            },
            {
                zone_name: "القناة",
                governorates: "بورسعيد,الإسماعيلية,السويس",
                base_cost: 35, cost_per_kg: 4,
                estimated_days_min: 2, estimated_days_max: 3
            },
            {
                zone_name: "صعيد مصر",
                governorates: "الفيوم,بني سويف,المنيا,أسيوط,سوهاج,قنا,الأقصر,أسوان,الوادي الجديد",
                base_cost: 45, cost_per_kg: 5,
                estimated_days_min: 3, estimated_days_max: 5
            },
            {
                zone_name: "المناطق الحدودية",
                governorates: "شمال سيناء,جنوب سيناء,البحر الأحمر,مطروح",
                base_cost: 60, cost_per_kg: 7,
                estimated_days_min: 4, estimated_days_max: 7
            }
        ]);
        console.log("Shipping Zones seeded.");

        // ── Disputes ──
        await Dispute.bulkCreate([
            {
                order_id: order1.id, opened_by: customer.id, against_user: supplier.id,
                reason: "تأخر في التسليم", description: "الطلب وصل بعد 5 أيام من الموعد المحدد",
                status: "resolved", resolution: "تم تعويض العميل بخصم 10% على الطلب التالي",
                resolved_by: admin.id, resolved_at: new Date()
            },
            {
                order_id: order2.id, opened_by: wholesaler.id, against_user: supplier.id,
                reason: "منتج تالف", description: "بعض العبوات وصلت مفتوحة",
                status: "open"
            }
        ]);
        console.log("Disputes seeded.");

        // ── KYC Documents ──
        await KycDocument.bulkCreate([
            { user_id: supplier.id, document_type: "commercial_register", document_number: "CR-2024-001", status: "approved", reviewed_by: admin.id, reviewed_at: new Date() },
            { user_id: supplier.id, document_type: "tax_card", document_number: "TC-2024-001", status: "approved", reviewed_by: admin.id, reviewed_at: new Date() },
            { user_id: wholesaler.id, document_type: "commercial_register", document_number: "CR-2024-002", status: "pending" },
            { user_id: retailer.id, document_type: "national_id", document_number: "NID-12345678", status: "pending" }
        ]);
        console.log("KYC Documents seeded.");

        // ── Category Commissions ──
        await CategoryCommission.bulkCreate([
            { category_id: categories[0].id, supplier_rate: 5.00, wholesaler_rate: 3.00, retailer_rate: 2.00, updated_by: admin.id },
            { category_id: categories[1].id, supplier_rate: 4.50, wholesaler_rate: 2.50, retailer_rate: 1.50, updated_by: admin.id },
            { category_id: categories[5].id, supplier_rate: 8.00, wholesaler_rate: 5.00, retailer_rate: 3.00, updated_by: admin.id }
        ]);
        console.log("Category Commissions seeded.");

        // ── Tiered Prices ──
        await TieredPrice.bulkCreate([
            { product_id: products[0].id, min_qty: 10, max_qty: 49, price_per_unit: 23.00 },
            { product_id: products[0].id, min_qty: 50, max_qty: 99, price_per_unit: 21.00 },
            { product_id: products[0].id, min_qty: 100, max_qty: null, price_per_unit: 19.00 },
            { product_id: products[2].id, min_qty: 5, max_qty: 19, price_per_unit: 8200.00 },
            { product_id: products[2].id, min_qty: 20, max_qty: null, price_per_unit: 7500.00 }
        ]);
        console.log("Tiered Prices seeded.");

        // ── Flash Sales ──
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        await FlashSale.bulkCreate([
            {
                product_id: products[1].id, sale_price: 35.00, original_price: 45.00,
                quantity_limit: 100, quantity_sold: 12, starts_at: new Date(), ends_at: futureDate,
                status: "active", created_by: supplier.id
            },
            {
                product_id: products[3].id, sale_price: 350.00, original_price: 450.00,
                quantity_limit: 50, quantity_sold: 0, starts_at: new Date(), ends_at: futureDate,
                status: "active", created_by: supplier.id
            }
        ]);
        console.log("Flash Sales seeded.");

        // ── Coupons ──
        const couponExpiry = new Date();
        couponExpiry.setMonth(couponExpiry.getMonth() + 3);
        await Coupon.bulkCreate([
            {
                code: "WELCOME10", discount_type: "percentage", discount_value: 10,
                min_order_amount: 100, max_uses: 1000, starts_at: new Date(), expires_at: couponExpiry,
                created_by: admin.id
            },
            {
                code: "CAIRO50", discount_type: "fixed", discount_value: 50,
                min_order_amount: 500, max_uses: 200, target_governorates: "القاهرة,الجيزة,القليوبية",
                starts_at: new Date(), expires_at: couponExpiry, created_by: admin.id
            },
            {
                code: "FOOD20", discount_type: "percentage", discount_value: 20,
                min_order_amount: 200, max_uses: 500, target_category_id: categories[0].id,
                starts_at: new Date(), expires_at: couponExpiry, created_by: admin.id
            }
        ]);
        console.log("Coupons seeded.");

        // ── Wishlists ──
        await Wishlist.bulkCreate([
            { user_id: customer.id, product_id: products[2].id, desired_qty: 1 },
            { user_id: customer.id, product_id: products[5].id, desired_qty: 1 },
            { user_id: retailer.id, product_id: products[0].id, desired_qty: 50 }
        ]);
        console.log("Wishlists seeded.");

        // ── Follow Suppliers ──
        await FollowSupplier.bulkCreate([
            { follower_id: customer.id, supplier_id: supplier.id },
            { follower_id: retailer.id, supplier_id: supplier.id },
            { follower_id: customer.id, supplier_id: wholesaler.id }
        ]);
        console.log("Follow Suppliers seeded.");

        // ── Audit Logs ──
        await AuditLog.bulkCreate([
            { user_id: admin.id, action: "seed_database", entity_type: "system", entity_id: null, details: "Initial database seeding", ip_address: "127.0.0.1" },
            { user_id: admin.id, action: "approve_kyc", entity_type: "kyc_document", entity_id: 1, details: "Approved supplier commercial register", ip_address: "127.0.0.1" }
        ]);
        console.log("Audit Logs seeded.");

        // ── RFQ System ──
        const rfq1 = await Rfq.create({
            buyer_id: wholesaler.id, product_id: products[0].id, product_name: "Premium Egyptian Rice",
            quantity: 500, unit: "kg", description: "نحتاج 500 كيلو أرز مصري فاخر لمتجرنا", target_price: 22.00
        });
        const rfq2 = await Rfq.create({
            buyer_id: retailer.id, product_name: "Custom T-Shirt Print",
            quantity: 200, unit: "piece", description: "طباعة تيشيرتات بتصميم مخصوص"
        });
        await RfqQuote.create({
            rfq_id: rfq1.id, supplier_id: supplier.id, unit_price: 21.50, total_price: 10750,
            notes: "سعر خاص للكمية الكبيرة", valid_until: futureDate
        });
        console.log("RFQ System seeded.");

        // ── Product Bundles ──
        const bundle = await ProductBundle.create({
            name: "حزمة المطبخ المتكاملة", description: "أرز + زيت + سكر بسعر مخفض",
            supplier_id: supplier.id, bundle_price: 350, original_total: 420
        });
        await BundleItem.bulkCreate([
            { bundle_id: bundle.id, product_id: products[0].id, quantity: 5 },
            { bundle_id: bundle.id, product_id: products[1].id, quantity: 2 }
        ]);
        console.log("Product Bundles seeded.");

        // ── Pre-Orders ──
        const preOrderDate = new Date();
        preOrderDate.setDate(preOrderDate.getDate() + 14);
        await PreOrder.create({
            buyer_id: wholesaler.id, product_id: products[2].id, quantity: 10,
            deposit_amount: 21250, total_amount: 85000, expected_date: preOrderDate,
            notes: "حجز موبايلات الشحنة القادمة"
        });
        console.log("Pre-Orders seeded.");

        // ── Sample Requests ──
        await SampleRequest.create({
            buyer_id: retailer.id, product_id: products[3].id, supplier_id: supplier.id,
            quantity: 2, sample_type: "free", cost: 0, shipping_address: "الجيزة، شارع الهرم",
            notes: "نريد تقييم الجودة قبل الطلب بالجملة"
        });
        console.log("Sample Requests seeded.");

        // ── Supplier MOV ──
        await SupplierMov.create({
            supplier_id: supplier.id, min_order_value: 500, currency: "EGP",
            message: "الحد الأدنى للطلب 500 جنيه مصري"
        });
        console.log("Supplier MOV seeded.");

        // ── Tax Configs ──
        await TaxConfig.bulkCreate([
            { name: "ضريبة القيمة المضافة (عام)", rate: 14, is_inclusive: false, updated_by: admin.id },
            { category_id: categories[0].id, name: "ضريبة المواد الغذائية", rate: 0, is_inclusive: false, updated_by: admin.id },
            { category_id: categories[5].id, name: "ضريبة الإلكترونيات", rate: 14, is_inclusive: false, updated_by: admin.id }
        ]);
        console.log("Tax Configs seeded.");

        // ── Unit Conversions ──
        await UnitConversion.bulkCreate([
            { from_unit: "kg", to_unit: "ton", factor: 0.001, category: "weight" },
            { from_unit: "kg", to_unit: "gram", factor: 1000, category: "weight" },
            { from_unit: "piece", to_unit: "dozen", factor: 0.083333, category: "count" },
            { from_unit: "piece", to_unit: "carton", factor: 0.04, category: "count" },
            { from_unit: "meter", to_unit: "cm", factor: 100, category: "length" },
            { from_unit: "liter", to_unit: "ml", factor: 1000, category: "volume" }
        ]);
        console.log("Unit Conversions seeded.");

        // ── Lot Tracking ──
        await LotTracking.bulkCreate([
            {
                product_id: products[0].id, lot_number: "LOT-RICE-001-2024", qr_code: "QR-A1B2C3D4E5F6",
                quantity: 200, manufacture_date: new Date("2024-01-15"), expiry_date: new Date("2025-01-15"),
                warehouse_id: warehouse.id, bin_location: "A-1-3", status: "active"
            },
            {
                product_id: products[1].id, lot_number: "LOT-OIL-002-2024", qr_code: "QR-F6E5D4C3B2A1",
                quantity: 100, manufacture_date: new Date("2024-03-01"), expiry_date: new Date("2025-06-01"),
                warehouse_id: warehouse.id, bin_location: "B-2-1", status: "active"
            }
        ]);
        console.log("Lot Tracking seeded.");

        // ── Subscription Plans ──
        await SubscriptionPlan.bulkCreate([
            {
                name: "الباقة الأساسية", tier: "basic", price_monthly: 100, price_yearly: 1000,
                max_products: 50, max_warehouses: 1, commission_discount: 0,
                features: JSON.stringify(["50 منتج", "مخزن واحد", "دعم بالبريد"])
            },
            {
                name: "الباقة الذهبية", tier: "gold", price_monthly: 500, price_yearly: 5000,
                max_products: 200, max_warehouses: 3, commission_discount: 10,
                features: JSON.stringify(["200 منتج", "3 مخازن", "خصم 10% عمولة", "دعم أولوية"])
            },
            {
                name: "الباقة البريميوم", tier: "premium", price_monthly: 2000, price_yearly: 20000,
                max_products: 9999, max_warehouses: 10, commission_discount: 25,
                features: JSON.stringify(["منتجات غير محدودة", "10 مخازن", "خصم 25% عمولة", "مدير حساب خاص"])
            }
        ]);
        console.log("Subscription Plans seeded.");

        // ── Loyalty Points ──
        await LoyaltyPoint.bulkCreate([
            { user_id: customer.id, points: 100, action: "order_complete", order_id: order1.id, description: "نقاط طلب #1" },
            { user_id: customer.id, points: 50, action: "review", description: "نقاط تقييم منتج" },
            { user_id: wholesaler.id, points: 200, action: "order_complete", order_id: order2.id, description: "نقاط طلب #2" }
        ]);
        console.log("Loyalty Points seeded.");

        // ── Referrals ──
        await Referral.create({
            referrer_id: supplier.id, referred_id: retailer.id,
            referral_code: "TL-2-REF001", reward_amount: 50, status: "completed", completed_at: new Date()
        });
        console.log("Referrals seeded.");

        // ── Badges ──
        const badges = await Badge.bulkCreate([
            { name: "مورد موثوق", slug: "verified-supplier", description: "مورد تم التحقق من هويته وسجله التجاري", criteria: "KYC approved", icon: "shield-check" },
            { name: "شحن سريع", slug: "fast-shipping", description: "متوسط تسليم أقل من 48 ساعة", criteria: "avg_delivery < 48h", icon: "truck-fast" },
            { name: "الأكثر مبيعاً", slug: "top-seller", description: "أعلى 10% في المبيعات الشهرية", criteria: "top_10_percent_sales", icon: "trophy" },
            { name: "تاجر نشط", slug: "active-trader", description: "أكثر من 50 طلب خلال 30 يوم", criteria: "orders > 50 in 30d", icon: "fire" }
        ]);
        await UserBadge.bulkCreate([
            { user_id: supplier.id, badge_id: badges[0].id },
            { user_id: supplier.id, badge_id: badges[1].id },
            { user_id: supplier.id, badge_id: badges[2].id }
        ]);
        console.log("Badges seeded.");

        // ── RMA ──
        await Rma.create({
            order_id: order1.id, buyer_id: customer.id, seller_id: supplier.id,
            reason: "منتج تالف", description: "بعض العبوات وصلت مكسورة",
            return_type: "partial", refund_amount: 100
        });
        console.log("RMA seeded.");

        // ── Back Orders ──
        const backOrderDate = new Date();
        backOrderDate.setDate(backOrderDate.getDate() + 21);
        await BackOrder.create({
            buyer_id: retailer.id, product_id: products[2].id, quantity: 5,
            expected_delivery: backOrderDate, notify_buyer: true
        });
        console.log("Back Orders seeded.");

        // ── Vacation Mode ──
        await VacationMode.create({
            supplier_id: wholesaler.id, is_active: false,
            message: "المتجر مفتوح", auto_reply: "مرحباً، كيف يمكننا مساعدتك؟"
        });
        console.log("Vacation Mode seeded.");

        console.log("\n✅ Seeding completed successfully!");
        console.log("──────────────────────────────────────");
        console.log("  Login credentials (all same password):");
        console.log("  Admin:      admin@tradelink.com     / password123");
        console.log("  Supplier:   supplier@tradelink.com  / password123");
        console.log("  Wholesaler: wholesale@tradelink.com / password123");
        console.log("  Retailer:   retail@tradelink.com    / password123");
        console.log("  Customer:   ahmed@consumer.com      / password123");
        console.log("──────────────────────────────────────");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();

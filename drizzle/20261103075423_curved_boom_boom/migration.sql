ALTER TABLE "product_variants" ADD COLUMN "sale_price" numeric(12,2);--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "stock" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sale_price" numeric(12,2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "product_sizes" DROP COLUMN "compare_at_price";
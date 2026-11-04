ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_unique";--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_unique" UNIQUE("size_id","color_id");
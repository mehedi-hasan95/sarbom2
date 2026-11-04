ALTER TABLE "product_colors" DROP CONSTRAINT "product_colors_unique";--> statement-breakpoint
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_unique" UNIQUE("product_slug","hex");
ALTER TABLE "product_variants" ADD COLUMN "price" numeric(12,2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "thumbnail" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price" numeric(12,2);--> statement-breakpoint
ALTER TABLE "product_sizes" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_images_images_url_fkey" FOREIGN KEY ("images") REFERENCES "images"("url") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_thumbnail_images_url_fkey" FOREIGN KEY ("thumbnail") REFERENCES "images"("url") ON DELETE CASCADE;
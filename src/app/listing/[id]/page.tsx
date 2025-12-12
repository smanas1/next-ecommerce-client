import { Suspense } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import ProductDetailsContent from "./productDetails";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function ProductDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent id={resolvedParams.id} />
    </Suspense>
  );
}

export default ProductDetailsPage;

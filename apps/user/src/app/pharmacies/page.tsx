import { Suspense } from 'react';
import { PharmaciesPage } from "@/features/pharmacies/pharmacies-page";

export const revalidate = 60; // 1-minute ISR edge revalidation

export default function Page() {
  return (
    <Suspense>
      <PharmaciesPage />
    </Suspense>
  );
}

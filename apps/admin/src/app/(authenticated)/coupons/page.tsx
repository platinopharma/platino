'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponsTab } from "./components/CouponsTab";
import { BundlesTab } from "./components/BundlesTab";
import { FlashSalesTab } from "./components/FlashSalesTab";
import { SettingsTab } from "./components/SettingsTab";

export default function PromotionsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Promotions & Incentives Engine</h1>
        <p className="text-muted-foreground mt-2">Manage all your global discount codes, product bundles, flash sales, and store-wide offers.</p>
      </div>
      
      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[600px] bg-[#0a0a0a] border border-border/40">
          <TabsTrigger value="coupons" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Discount Codes</TabsTrigger>
          <TabsTrigger value="bundles" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Bundles (BOGO)</TabsTrigger>
          <TabsTrigger value="flash-sales" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Flash Sales</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Store Settings</TabsTrigger>
        </TabsList>
        
        <div className="mt-8">
          <TabsContent value="coupons" className="m-0 focus-visible:outline-none">
            <CouponsTab />
          </TabsContent>
          <TabsContent value="bundles" className="m-0 focus-visible:outline-none">
            <BundlesTab />
          </TabsContent>
          <TabsContent value="flash-sales" className="m-0 focus-visible:outline-none">
            <FlashSalesTab />
          </TabsContent>
          <TabsContent value="settings" className="m-0 focus-visible:outline-none">
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

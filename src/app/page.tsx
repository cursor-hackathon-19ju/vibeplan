import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { FilterOptions } from "@/components/FilterOptions"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        <MobileNav />
        
        <main className="container max-w-4xl mx-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-2">
              Plan Your Perfect Weekend
            </h1>
            <p className="text-muted-foreground text-lg">
              Tell us what you're looking for and let AI do the magic ✨
            </p>
          </div>

          <FilterOptions />
        </main>
      </div>
    </div>
  )
}


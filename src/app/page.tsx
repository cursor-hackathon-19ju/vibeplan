import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { FilterOptions } from "@/components/FilterOptions"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <MobileNav />
        
        <main className="flex-1 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-4xl">
            <FilterOptions />
          </div>
        </main>
      </div>
    </div>
  )
}


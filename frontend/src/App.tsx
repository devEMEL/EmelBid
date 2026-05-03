import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/app/page";
import PoolsPage from "@/app/pools/page";
import ProfilePage from "@/app/profile/page";
import ActivityPage from "@/app/activity/page";
import AddTokenPage from "@/app/add-token/page";
import CreatePoolPage from "@/app/pools/create/page";
import PoolDetailsPage from "@/app/pools/id/page";
import CreatePositionsPage from "@/app/positions/create/page";
import PositionDetailsPage from "@/app/positions/id/page";

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Providers>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-24">
            {children}
          </main>
          <Footer />
        </div>
      </Providers>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pools" element={<PoolsPage />} />
          <Route path="/pools/create" element={<CreatePoolPage />} />
          <Route path="/pools/:id" element={<PoolDetailsPage />} />
          <Route path="/positions/create/:params" element={<CreatePositionsPage />} />
          <Route path="/positions/:id" element={<PositionDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/add-token" element={<AddTokenPage />} />
        </Routes>
      </RootLayout>
    </Router>
  );
}

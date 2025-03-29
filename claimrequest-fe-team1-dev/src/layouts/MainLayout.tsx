import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { memo } from "react";

interface Props {
  children: React.ReactNode;
}

const MainLayoutInner: React.FC<Props> = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <div className="main-layout-content">{children}</div>
      <Footer />
    </div>
  );
};

const MainLayout = memo(MainLayoutInner);

export default MainLayout;

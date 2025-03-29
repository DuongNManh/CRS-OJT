import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import PageTransition from "@/components/ui/PageTransition";
import { memo } from "react";

interface Props {
  children: React.ReactNode;
}

const MainLayoutInner: React.FC<Props> = ({ children }) => {
  return (
    <main className="">
      <Header />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </main>
  );
};

const MainLayout = memo(MainLayoutInner);

export default MainLayout;

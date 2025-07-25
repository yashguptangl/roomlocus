import Footer from "../../components/footer";
import Navbar from "../../components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    <div className="fixed bottom-0 w-full" data-footer="true">
      <Footer />
    </div>
     
    </>
  );
}
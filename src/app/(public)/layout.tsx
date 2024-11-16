import { ReactNode } from "react";
const PublicLayout = ({ children }: { children: ReactNode }) => {
  return <div className="container my-6">{children}</div>;
};

export default PublicLayout;

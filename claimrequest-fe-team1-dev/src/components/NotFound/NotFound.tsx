// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import Button from "antd/lib/Button";
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="mt-4">The content you are looking for does not exist.</p>
      <Button type="primary" className="mt-4" onClick={() => navigate("/")}>
        Go to Home
      </Button>
    </div>
  );
};

export default NotFound;

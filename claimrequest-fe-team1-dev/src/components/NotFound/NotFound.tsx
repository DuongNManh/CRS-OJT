import Button from 'antd/lib/Button';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';

const handleBack = () => {
    Navigate(-1);
}

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
          <p className="mt-4">The content you are looking for does not exist.</p>
          <Button type="primary" className="mt-4">
             onClick={handleBack}
          </Button>
    </div>
  );
};

export default NotFound;

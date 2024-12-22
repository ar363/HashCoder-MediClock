import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { setAuth, getAuth } from "@/lib/utils";

const LogoutBtn: React.FC = () => {
  return (
    <>
      {getAuth().token !== "" && (
        <div className="absolute top-4 right-16">
          <Button
            onClick={() => {
              setAuth(0, "", null);
              window.location.href = "/";
            }}
            variant={"ghost"}
            className="text-gray-500 dark:text-gray-400"
          >
            Logout
          </Button>
        </div>
      )}
    </>
  );
};

export default LogoutBtn;

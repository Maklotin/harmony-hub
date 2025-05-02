import { useEffect, useState } from "react";
import Nav from "~/components/Nav";
import { Box, Button, ClickableLogo } from "~/components/ui-library";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [loginId, setLoginId] = useState<string | null>(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const user = await getCurrentUser();
  //       if (user.signInDetails && user.signInDetails.loginId) {
  //         setLoginId(user.signInDetails.loginId);
  //       } else {
  //         navigate("/login");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user:", error);
  //     }
  //   };

  //   fetchUser();
  // }, []);

  const handleLogOut = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <ClickableLogo />
        <Nav />
      </div>
      <div className="flex justify-center w-full">
        <Box className="p-4 w-1/2">
          <h1 className="mb-8 text-center">User settings</h1>
          <p>email: {loginId}</p>
          <p className="my-8 text-saffron">more coming soon...</p>
          <Button onClick={handleLogOut}>Log out</Button>
        </Box>
      </div>
    </div>
  );
}

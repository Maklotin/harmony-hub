import type { MetaFunction } from "@remix-run/node";
import DiscoverMusic from "~/components/DiscoverMusic";
import Nav from "~/components/Nav";
import { Button, ClickableLogo } from "~/components/ui-library";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Harmony Hub" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const storeUserData = async () => {
  try {
    const session = await fetchAuthSession();
    
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error('User is not authenticated');
    }
    await fetch('https://2ti3a1zg47.execute-api.eu-north-1.amazonaws.com/v1/user', {
      method: 'POST',
      headers: {
        Authorization: token,  
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customData: 'some user-specific data',
      }),
    });

    console.log('custom user data sent!');
  } catch (error) {
    console.error('Error:', error);
  }
};


export default function Index() {
  const [loginId, setLoginId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user.signInDetails && user.signInDetails.loginId) {
          setLoginId(user.signInDetails.loginId);
          await storeUserData();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return <div>{loginId ? <Home /> : <LoginNeeded />}</div>;
}

function Home() {
  return (
    <div>
      <div className="flex justify-between flex-wrap">
        <ClickableLogo />
        <Nav />
      </div>
      <div className="flex flex-col items-center">
        <DiscoverMusic />
      </div>
    </div>
  );
}

function LoginNeeded() {
  const navigate = useNavigate();

  return (
    <div>
      <ClickableLogo />
      <div className="flex flex-col items-center">
        <p>You need to login to access this page.</p>
        <Button onClick={() => navigate("/login")}>Login</Button>
      </div>
    </div>
  );
}

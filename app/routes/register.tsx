import { useState } from "react";
import {
  Box,
  Button,
  ClickableLogo,
  TextInput,
  Textlink,
} from "~/components/ui-library";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegisterUser = async () => {
    try {
      setSuccess("Account registered!");
    } catch (error) {
      setError((error as Error).message || "An error occurred during sign-up");
      console.error("Error signing up:", error);
    }
  };

  return (
    <div>
      <ClickableLogo />
      <div className="flex flex-col items-center">
        <Box>
          <form
            className="flex flex-col items-center justify-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <h2 className="mt-12 underline">Register account</h2>
            <div className="flex flex-col items-center">
              <h4 className="mt-4">Username</h4>
              <TextInput
                className="mt-4"
                type="text"
                placeholder="name nameson"
                // value={email}
                // onChange={(e) => setEmail(e.target.value)}
                required
              />
              <h4 className="mt-4">Email</h4>
              <TextInput
                className="mt-4"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <h4 className="mt-4">Password</h4>
              <TextInput
                className="mt-4"
                type="password"
                placeholder="pass1234"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <h4 className="mt-4">Confirm password</h4>
              <TextInput
                className="mt-4 mb-12"
                type="password"
                placeholder="pass1234"
                required
              />
              <Button
                type="submit"
                onClick={handleRegisterUser}
                className="bg-emerald !shadow-darkForest"
              >
                <p>Register account</p>
                <i className="ri-check-line ml-2"></i>
              </Button>
            </div>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                role="alert"
              >
                <p className="font-bold">{error}</p> 
              </div>
            )}
            {success && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
                role="alert"
              >
                <p className="font-bold">{success}</p>
              </div>
            )}
            <Textlink to="/login" className="mb-4">
              <p>Back to login</p>
            </Textlink>
          </form>
        </Box>
      </div>
    </div>
  );
}

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password
    });

    if (result.error) {
      alert("Invalid username or password");
    } else {
      router.push("/");
    }
  };

  const handleForgotRedirect = () => {
    router.push("/forget-password");
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center my-4">Login</h1>
          <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
          <p className="mt-3 text-center">
            Forgot Password? 
            <button onClick={handleForgotRedirect} className="btn btn-link">
              Click Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

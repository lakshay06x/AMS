import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const withAuth = (WrappedComponent, options = { adminOnly: false }) => {
  return (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return; // Do nothing while loading
      if (!session) {
        router.push("/login");
      } else if (options.adminOnly && !session.user.isAdmin) {
        router.push("/not-authorized"); // Redirect non-admin users
      }
    }, [session, status]);

    if (status === "loading") {
      return <p>Loading...</p>;
    }

    if (!session) {
      return null; // Redirecting to login
    }

    if (options.adminOnly && !session.user.isAdmin) {
      return null; // Redirecting to not authorized
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

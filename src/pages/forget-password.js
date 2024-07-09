import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ForgotPassword = () => {
  const [officeId, setOfficeId] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/verify-user', { officeId, username });
      if (response.data.success) {
        setIsVerified(true);
        setMessage('User verified. Please set your new password.');
      } else {
        setMessage('User verification failed.');
      }
    } catch (error) {
      setMessage('Verification failed.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/reset-password', { officeId, username, newPassword });
      setMessage(response.data.message);
      if (response.status === 200) {
        // Redirect to login page after successful password reset
        alert("Password changed successfully!");
        router.push('/login');
      }
    } catch (error) {
      setMessage('Password reset failed.');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center my-4">Forgot Password</h1>
          {!isVerified ? (
            <form onSubmit={handleVerify} className="p-4 border rounded shadow">
              <div className="mb-3">
                <label htmlFor="officeId" className="form-label">Office ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="officeId" 
                  value={officeId} 
                  onChange={(e) => setOfficeId(e.target.value)} 
                  placeholder="Enter your office ID" 
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter your username" 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Verify User</button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="p-4 border rounded shadow">
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="newPassword" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter your new password" 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Reset Password</button>
            </form>
          )}
          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

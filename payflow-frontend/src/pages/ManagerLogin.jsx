// // import React, { useState } from 'react';
// // import './Login.css';
// // import { useNavigate } from 'react-router-dom';


// // const ManagerLogin = () => {
// //     const [email, setEmail] = useState('');
// //     const [password, setPassword] = useState('');
// //     const navigate = useNavigate();

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();

// //         try {
// //             const res = await fetch('http://localhost:8080/api/login', {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify({ email, password })
// //             });

// //             const data = await res.json();

// //             if (res.ok) {
// //                 localStorage.setItem('email', data.email);
// //                 if (data.mustResetPassword) {
// //                     navigate('/reset-password');
// //                 } else {
// //                     navigate(`/${data.role.toLowerCase()}-dashboard`);
// //                 }
// //             } else {
// //                 alert(data.message || 'Login failed');
// //             }
// //         } catch (error) {
// //             alert('Server error. Please try again.');
// //         }
// //     };

// //     return (
// //         <div className="login-container">
// //             <h2>Manager Login</h2>
// //             <form onSubmit={handleSubmit}>
// //                 <input
// //                     type="email"
// //                     placeholder="Manager Email"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     required
// //                 />
// //                 <input
// //                     type="password"
// //                     placeholder="Manager Password"
// //                     value={password}
// //                     onChange={(e) => setPassword(e.target.value)}
// //                     required
// //                 />
// //                 <button type="submit">Login</button>
// //             </form>
// //         </div>
// //     );
// // };

// // export default ManagerLogin;

// import React, { useState } from 'react';
// import './Login.css';
// import { useNavigate } from 'react-router-dom';

// const ManagerLogin = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (email === 'manager@example.com' && password === 'manager@123') {
//             localStorage.setItem("role", "MANAGER");
//             localStorage.setItem("email", email);
//             navigate('/reset-password');
//             return;
//         }

//         if (email === 'manager@example.com' && password !== '') {
//             localStorage.setItem("role", "MANAGER");
//             localStorage.setItem("email", email);
//             navigate('/manager-dashboard');
//             return;
//         }

//         alert('Invalid credentials');
//     };

//     return (
//         <div className="login-container">
//             <h2>Manager Login</h2>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="email"
//                     placeholder="Manager Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                 />
//                 <input
//                     type="password"
//                     placeholder="Manager Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                 />
//                 <button type="submit">Login</button>
//             </form>
//         </div>
//     );
// };

// export default ManagerLogin;

import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const ManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email, // backend expects `username`
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('email', email);
        localStorage.setItem('role', data.role);
        // Store managerId for dashboard/leave requests
        if (data.managerId) {
          localStorage.setItem('managerId', data.managerId);
        }
        if (data.firstLogin) {
          navigate('/reset-password');
        } else {
          navigate('/manager-dashboard'); // Make sure this route exists!
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Server error. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Manager Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Manager Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Manager Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default ManagerLogin;

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
export default function Register() {
  const [name,email,password] = [useState(''),useState(''),useState('')];
  // simpler: handle inputs...
  const handleSubmit = async e => {
    e.preventDefault();
    await fetch(process.env.REACT_APP_API_URL + '/api/auth/register', {
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name,email,password})
    });
    // then fetch /me or redirect
  };
  return (<form onSubmit={handleSubmit}>/* inputs and submit */</form>);
}
